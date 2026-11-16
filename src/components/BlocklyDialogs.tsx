import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIDE } from '@/contexts/IDEContext';
import { translations } from '@/lib/i18n';
import { consumePromptTitle, checkVariableName } from '@/lib/blocks/variables';

/**
 * Reemplaza las ventanas del navegador (prompt / alert / confirm) que usa
 * Blockly —crear variable, renombrar, "ese nombre ya existe", borrar una
 * variable en uso— por diálogos propios de la plataforma.
 */
type DialogRequest =
  | { kind: 'prompt'; title: string; message: string; defaultValue: string; resolve: (v: string | null) => void }
  | { kind: 'alert'; title: string; message: string; resolve: () => void }
  | { kind: 'confirm'; title: string; message: string; resolve: (ok: boolean) => void };

const BlocklyDialogs: React.FC = () => {
  const { language } = useIDE();
  const dict = translations[language];
  const dictRef = useRef(dict);
  dictRef.current = dict;

  const [request, setRequest] = useState<DialogRequest | null>(null);
  const [value, setValue] = useState('');
  // Evita responder dos veces a Blockly (botón + cierre del diálogo).
  const resolvedRef = useRef(false);

  useEffect(() => {
    const open = (req: DialogRequest) => {
      resolvedRef.current = false;
      if (req.kind === 'prompt') setValue(req.defaultValue);
      setRequest(req);
    };

    Blockly.dialog.setPrompt((message, defaultValue, callback) => {
      open({
        kind: 'prompt',
        title: consumePromptTitle() ?? dictRef.current.dlg_title_variable,
        message,
        defaultValue,
        resolve: callback,
      });
    });
    Blockly.dialog.setAlert((message, callback) => {
      open({ kind: 'alert', title: dictRef.current.dlg_title_alert, message, resolve: () => callback?.() });
    });
    Blockly.dialog.setConfirm((message, callback) => {
      open({ kind: 'confirm', title: dictRef.current.dlg_title_confirm, message, resolve: callback });
    });
  }, []);

  const finish = (result: 'ok' | 'cancel') => {
    if (!request || resolvedRef.current) return;
    resolvedRef.current = true;
    const req = request;
    setRequest(null);
    // Se responde después de cerrar, por si Blockly abre otro diálogo enseguida
    // (por ejemplo "ese nombre ya existe" tras crear una variable).
    setTimeout(() => {
      if (req.kind === 'prompt') req.resolve(result === 'ok' ? value : null);
      else if (req.kind === 'confirm') req.resolve(result === 'ok');
      else req.resolve();
    }, 0);
  };

  // En esta plataforma el diálogo de texto solo se usa para nombres de variable.
  const nameProblem = request?.kind === 'prompt' ? checkVariableName(value) : null;
  const nameError =
    nameProblem === 'reserved'
      ? dict.dlg_err_reserved.replace('{name}', value.trim())
      : nameProblem === 'digit'
        ? dict.dlg_err_digit
        : null;
  const canAccept = request?.kind !== 'prompt' || (value.trim() !== '' && !nameError);

  return (
    <Dialog open={request !== null} onOpenChange={(open) => { if (!open) finish('cancel'); }}>
      <DialogContent className="sm:max-w-sm bg-card border-border rounded-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canAccept) finish('ok');
          }}
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">{request?.title}</DialogTitle>
            <DialogDescription className="whitespace-pre-wrap">{request?.message}</DialogDescription>
          </DialogHeader>

          {request?.kind === 'prompt' && (
            <Input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={(e) => e.target.select()}
              className={`font-mono ${nameError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              aria-invalid={!!nameError}
            />
          )}
          {nameError && <p className="text-xs text-destructive -mt-2">{nameError}</p>}

          <DialogFooter className="gap-2 sm:gap-0">
            {request?.kind !== 'alert' && (
              <Button type="button" variant="ghost" onClick={() => finish('cancel')}>
                {dict.dlg_cancel}
              </Button>
            )}
            <Button type="submit" disabled={!canAccept} autoFocus={request?.kind !== 'prompt'}>
              {dict.dlg_ok}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BlocklyDialogs;
