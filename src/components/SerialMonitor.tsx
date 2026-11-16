import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, memo } from 'react';
import { useIDE, SerialMessage } from '@/contexts/IDEContext';
import {
  Trash2,
  Send,
  Plug,
  Unplug,
  ArrowDown,
  Radio,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  isWebSerialSupported,
  requestSerialPort,
  openSerialConnection,
  closeSerialConnection,
  writeToSerial,
  SerialConnection
} from '@/lib/webserial';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const BAUD_RATES = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200];

// Fin de línea que se agrega al enviar (igual que el monitor del Arduino IDE).
// Por defecto "Ninguno": enviar "1" llega a la placa exactamente como "1".
const LINE_ENDINGS = {
  none: { label: 'Sin fin de línea', value: '' },
  lf: { label: 'Nueva línea (\\n)', value: '\n' },
  cr: { label: 'Retorno (\\r)', value: '\r' },
  crlf: { label: 'Ambos (\\r\\n)', value: '\r\n' },
} as const;
type LineEnding = keyof typeof LINE_ENDINGS;
const LINE_ENDING_STORAGE_KEY = 'm4rk_serial_line_ending';

// Si llega texto sin salto de línea (p. ej. Serial.print sin println),
// se muestra tras este tiempo sin recibir más datos.
const PARTIAL_LINE_TIMEOUT_MS = 200;
// Las líneas recibidas se agrupan y se pintan como máximo cada 50 ms.
const FLUSH_INTERVAL_MS = 50;

const loadLineEnding = (): LineEnding => {
  try {
    const saved = localStorage.getItem(LINE_ENDING_STORAGE_KEY);
    if (saved && saved in LINE_ENDINGS) return saved as LineEnding;
  } catch { /* almacenamiento no disponible */ }
  return 'none';
};

const SerialRow = memo(({ msg }: { msg: SerialMessage }) => (
  <div
    className={`py-2 px-3 rounded-xl whitespace-pre-wrap break-all ${
      msg.type === 'sent'
        ? 'bg-primary/10 text-primary border-l-4 border-primary ml-8'
        : 'bg-card text-foreground border-l-4 border-success mr-8 shadow-sm'
    }`}
  >
    <span className={`${msg.type === 'sent' ? 'text-primary/60' : 'text-success/60'} mr-2`}>
      {msg.type === 'sent' ? '→' : '←'}
    </span>
    {msg.content === '' ? ' ' : msg.content}
  </div>
));
SerialRow.displayName = 'SerialRow';

const SerialMonitor: React.FC = () => {
  const {
    serialMessages,
    addSerialMessage,
    addSerialMessages,
    clearSerialMessages,
    serialBaudRate,
    setSerialBaudRate,
    addConsoleMessage,
    isConnected: ideConnected,
    setIsConnected
  } = useIDE();

  const [inputValue, setInputValue] = useState('');
  const [isMonitorConnected, setIsMonitorConnected] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [lineEnding, setLineEnding] = useState<LineEnding>(loadLineEnding);
  const connectionRef = useRef<SerialConnection | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const readLoopRef = useRef<boolean>(false);

  // Búfer de recepción: se acumula hasta encontrar '\n'
  const lineBufferRef = useRef('');
  const pendingLinesRef = useRef<string[]>([]);
  const flushTimerRef = useRef<number | null>(null);
  const partialTimerRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [serialMessages, autoScroll]);

  const handleLineEndingChange = (value: string) => {
    setLineEnding(value as LineEnding);
    try { localStorage.setItem(LINE_ENDING_STORAGE_KEY, value); } catch { /* ignorar */ }
  };

  const flushPendingLines = useCallback(() => {
    if (flushTimerRef.current !== null) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    const lines = pendingLinesRef.current;
    if (lines.length > 0) {
      pendingLinesRef.current = [];
      addSerialMessages('received', lines);
    }
  }, [addSerialMessages]);

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current === null) {
      flushTimerRef.current = window.setTimeout(flushPendingLines, FLUSH_INTERVAL_MS);
    }
  }, [flushPendingLines]);

  // Pasa a "líneas pendientes" lo que quedó sin salto de línea
  const flushPartialLine = useCallback(() => {
    if (partialTimerRef.current !== null) {
      clearTimeout(partialTimerRef.current);
      partialTimerRef.current = null;
    }
    if (lineBufferRef.current) {
      pendingLinesRef.current.push(lineBufferRef.current.replace(/\r$/, ''));
      lineBufferRef.current = '';
    }
    scheduleFlush();
  }, [scheduleFlush]);

  const handleIncomingText = useCallback((text: string) => {
    const parts = (lineBufferRef.current + text).split('\n');
    lineBufferRef.current = parts.pop() ?? '';
    for (const line of parts) {
      // println envía "\r\n": se quita el '\r' final
      pendingLinesRef.current.push(line.replace(/\r$/, ''));
    }

    if (partialTimerRef.current !== null) {
      clearTimeout(partialTimerRef.current);
      partialTimerRef.current = null;
    }
    if (lineBufferRef.current) {
      partialTimerRef.current = window.setTimeout(flushPartialLine, PARTIAL_LINE_TIMEOUT_MS);
    }
    if (pendingLinesRef.current.length > 0) scheduleFlush();
  }, [flushPartialLine, scheduleFlush]);

  const startReadLoop = useCallback(async () => {
    if (!connectionRef.current?.reader) return;

    readLoopRef.current = true;
    lineBufferRef.current = '';
    // stream: true conserva los bytes de una tilde/ñ partida entre dos fragmentos
    const decoder = new TextDecoder();

    while (readLoopRef.current && connectionRef.current?.reader) {
      try {
        const { value, done } = await connectionRef.current.reader.read();
        if (done) break;
        if (value) {
          handleIncomingText(decoder.decode(value, { stream: true }));
        }
      } catch (error) {
        if (readLoopRef.current) {
          console.error('Read error:', error);
        }
        break;
      }
    }

    // Mostrar lo que quedara en el búfer al terminar la lectura
    const rest = decoder.decode();
    if (rest) handleIncomingText(rest);
    flushPartialLine();
    flushPendingLines();
  }, [handleIncomingText, flushPartialLine, flushPendingLines]);

  const handleConnect = async () => {
    if (!isWebSerialSupported()) {
      toast.error('WebSerial no está soportado. Usa Chrome o Edge.');
      addConsoleMessage('error', 'WebSerial not supported');
      return;
    }

    try {
      const port = await requestSerialPort();
      if (!port) return;

      const connection = await openSerialConnection(port, serialBaudRate);
      connectionRef.current = connection;
      setIsMonitorConnected(true);
      setIsConnected(true);
      addConsoleMessage('success', `Monitor serie conectado a ${serialBaudRate} baudios`);
      toast.success('¡Monitor serie conectado! 🎉');

      startReadLoop();
    } catch (error) {
      addConsoleMessage('error', `Falló la conexión: ${error}`);
      toast.error('No se pudo conectar al puerto serie');
    }
  };

  const handleDisconnect = useCallback(async () => {
    readLoopRef.current = false;

    if (connectionRef.current) {
      await closeSerialConnection(connectionRef.current);
      connectionRef.current = null;
    }

    setIsMonitorConnected(false);
    setIsConnected(false);

    addConsoleMessage('info', 'Monitor serie desconectado');
    toast.info('Monitor serie desconectado');
  }, [setIsConnected, addConsoleMessage]);

  // Solo se envía si hay algo visible: espacios o campo vacío no se mandan.
  // Se recortan los espacios de los extremos para que " 1 " llegue como "1".
  const textToSend = inputValue.trim();
  const canSend = isMonitorConnected && textToSend !== '';

  const handleSend = async () => {
    if (!connectionRef.current || !canSend) return;

    try {
      await writeToSerial(connectionRef.current, textToSend + LINE_ENDINGS[lineEnding].value);
      addSerialMessage('sent', textToSend);
      setInputValue('');
    } catch (error) {
      addConsoleMessage('error', `Error al enviar: ${error}`);
      toast.error('Error al enviar datos');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    return () => {
      readLoopRef.current = false;
      if (flushTimerRef.current !== null) clearTimeout(flushTimerRef.current);
      if (partialTimerRef.current !== null) clearTimeout(partialTimerRef.current);
      if (connectionRef.current) {
        closeSerialConnection(connectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!ideConnected && isMonitorConnected) {
      console.log("Forzando desconexión del monitor serie...");
      handleDisconnect();
    }
  }, [ideConnected, isMonitorConnected, handleDisconnect]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-card to-muted/20 rounded-b-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 ${isMonitorConnected ? 'text-success' : 'text-muted-foreground'}`} />
          <span className="text-sm font-bold text-foreground">Monitor Serie</span>
          {isMonitorConnected && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="status-dot status-dot-connected ml-1"
            />
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Baud Rate Selector */}
          <Select
            value={serialBaudRate.toString()}
            onValueChange={(v) => setSerialBaudRate(Number(v))}
            disabled={isMonitorConnected}
          >
            <SelectTrigger className="neu-input w-24 h-9 text-xs font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="ide-panel border-none">
              {BAUD_RATES.map((rate) => (
                <SelectItem key={rate} value={rate.toString()} className="font-medium rounded-lg">
                  {rate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Boton de Conectar/Desconectar */}
          {isMonitorConnected ? (
            <button
              onClick={handleDisconnect}
              className="clay-btn h-9 px-3 text-xs bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20"
            >
              <Unplug className="w-4 h-4 mr-1.5" />
              Desconectar
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="clay-btn clay-btn-success h-9 px-3 text-xs"
            >
              <Plug className="w-4 h-4 mr-1.5" />
              Conectar
            </button>
          )}

          {/* Auto-scroll */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`h-9 w-9 p-0 rounded-xl transition-colors ${
              autoScroll ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
            }`}
            title={autoScroll ? 'Auto-scroll activado' : 'Auto-scroll desactivado'}
          >
            <ArrowDown className="w-4 h-4" />
          </Button>

          {/* Boton para limpiar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSerialMessages}
            title="Limpiar monitor"
            className="h-9 w-9 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Area de Mensaje */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto bg-muted/10">
        <div className="p-4 font-mono text-sm space-y-1.5">
          {serialMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <motion.div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-4 ${
                  isMonitorConnected
                    ? 'bg-success/10 border-2 border-success/30'
                    : 'bg-muted/30 border-2 border-border'
                }`}
                animate={isMonitorConnected ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className={`w-10 h-10 ${isMonitorConnected ? 'text-success' : 'text-muted-foreground/50'}`} />
              </motion.div>
              <p className="text-muted-foreground font-medium font-sans">
                {isMonitorConnected
                  ? 'Esperando datos...'
                  : 'Conecta para ver la salida serie'}
              </p>
            </div>
          ) : (
            serialMessages.map((msg) => <SerialRow key={msg.id} msg={msg} />)
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex items-center gap-2 p-3 border-t border-border bg-card/50 flex-wrap">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Escribe un mensaje..."
          disabled={!isMonitorConnected}
          className="neu-input flex-1 min-w-[8rem] h-10 text-sm"
        />
        {/* Fin de línea que se agrega al enviar */}
        <Select value={lineEnding} onValueChange={handleLineEndingChange}>
          <SelectTrigger
            className="neu-input w-40 h-10 text-xs font-bold"
            title="Qué se agrega al final de cada mensaje enviado"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="ide-panel border-none">
            {(Object.keys(LINE_ENDINGS) as LineEnding[]).map((key) => (
              <SelectItem key={key} value={key} className="font-medium rounded-lg text-xs">
                {LINE_ENDINGS[key].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="clay-btn clay-btn-primary h-10 px-5"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SerialMonitor;
