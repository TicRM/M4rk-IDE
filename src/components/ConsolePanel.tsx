import React, { useRef, useEffect, useLayoutEffect, memo } from 'react';
import { useIDE, ConsoleMessage } from '@/contexts/IDEContext';
import { Trash2, AlertCircle, Info, CheckCircle, AlertTriangle, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getIcon = (type: string) => {
  switch (type) {
    case 'error':
      return <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />;
    case 'success':
      return <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />;
    default:
      return <Info className="w-4 h-4 text-primary/70 flex-shrink-0" />;
  }
};

const getColorClass = (type: string) => {
  switch (type) {
    case 'error':
      return 'text-destructive bg-destructive/10 border-destructive/20';
    case 'warning':
      return 'text-warning bg-warning/10 border-warning/20';
    case 'success':
      return 'text-success bg-success/10 border-success/20';
    default:
      return 'text-foreground bg-muted/30 border-border';
  }
};

// Fila memorizada y sin animación: con miles de mensajes, animar cada uno vuelve lenta la UI.
const ConsoleRow = memo(({ msg }: { msg: ConsoleMessage }) => (
  <div className={`flex items-start gap-3 p-3 rounded-xl border-2 ${getColorClass(msg.type)} font-mono text-xs`}>
    {getIcon(msg.type)}
    <div className="flex-1 min-w-0">
      <span className="text-muted-foreground text-[10px] block mb-1 font-sans">
        {msg.timestamp.toLocaleTimeString()}
      </span>
      <span className="break-all whitespace-pre-wrap leading-relaxed">{msg.message}</span>
    </div>
  </div>
));
ConsoleRow.displayName = 'ConsoleRow';

const ConsolePanel: React.FC = () => {
  const { consoleMessages, clearConsole } = useIDE();
  const scrollRef = useRef<HTMLDivElement>(null);
  // Solo se baja automáticamente si el usuario ya estaba al final (no interrumpe si está leyendo arriba).
  const stickToBottomRef = useRef(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  };

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [consoleMessages]);

  // Al limpiar, volver a seguir el final
  useEffect(() => {
    if (consoleMessages.length === 0) stickToBottomRef.current = true;
  }, [consoleMessages.length]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-card to-muted/20 rounded-b-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-warning" />
          <span className="text-sm font-bold text-foreground">Consola</span>
          {consoleMessages.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-warning/15 text-warning text-[10px] font-bold border border-warning/30">
              {consoleMessages.length}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearConsole}
          title="Limpiar consola"
          className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Mensajes */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 space-y-2">
          {consoleMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center mb-4 border-2 border-border">
                <Terminal className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">
                La salida aparecerá aquí
              </p>
            </div>
          ) : (
            consoleMessages.map((msg) => <ConsoleRow key={msg.id} msg={msg} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsolePanel;
