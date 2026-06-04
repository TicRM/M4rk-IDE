import React from 'react';
import { useIDE } from '@/contexts/IDEContext';
import { 
  Usb, 
  Upload, 
  Hammer,
  Save,
  FolderOpen,
  FilePlus,
  AlertCircle,
  Download,
  HardDrive,
  FileCode,
  Menu,
  Cpu,
  Globe,
  Blocks,
  Code,
  Terminal,
  Radio,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ARDUINO_BOARDS, isWebSerialSupported, requestSerialPort, uploadToArduino, parseHexFile } from '@/lib/webserial';
import { compileArduinoCode } from '@/lib/cloud-storage';
import { exportToFile, importFromFile, exportAsIno } from '@/lib/file-operations';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import * as Blockly from 'blockly';
import { getTranslation } from '@/lib/i18n';
import { useIsMobile } from '@/hooks/use-mobile';

interface ToolbarProps {
  onSave: () => void;
  onNewProject: (name: string) => void;
  onOpenProject: (id: string) => void;
  onImportProject: (blocklyXml: string, name: string, board: string) => void;
  activeTabMobile?: 'blocks' | 'code' | 'console' | 'serial';
  onMobileTabChange?: (tab: 'blocks' | 'code' | 'console' | 'serial') => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  onSave, 
  onNewProject, 
  onOpenProject,
  onImportProject,
  activeTabMobile,
  onMobileTabChange
}) => {
  const { 
    selectedBoard, 
    setSelectedBoard,
    isConnected,
    setIsConnected,
    isUploading,
    setIsUploading,
    uploadProgress,
    setUploadProgress,
    currentProject,
    projects,
    loadProjects,
    addConsoleMessage,
    generatedCode,
    setActiveTab,
    language,
    setLanguage
  } = useIDE();
  const isMobile = useIsMobile();

  const [newProjectName, setNewProjectName] = React.useState('');
  const [showNewDialog, setShowNewDialog] = React.useState(false);
  const [showNoSerialDialog, setShowNoSerialDialog] = React.useState(false);
  const [compiledHex, setCompiledHex] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  React.useEffect(() => {
    if (compiledHex) {
      setCompiledHex(null);
    }
  }, [generatedCode]);

  const handleConnect = async () => {
    if (!isWebSerialSupported()) {
      setShowNoSerialDialog(true);
      return;
    }

    try {
      const port = await requestSerialPort();
      if (port) {
        setIsConnected(true);
        addConsoleMessage('success', 'Placa conectada');
        toast.success('Placa conectada');
      }
    } catch (error) {
      addConsoleMessage('error', `Error de conexión: ${error}`);
      toast.error('Error al conectar con la placa');
    }
  };

  const handleBuild = async () => {
    addConsoleMessage('info', '━━━ Iniciando compilación ━━━');
    addConsoleMessage('info', `Placa: ${selectedBoard.name} (${selectedBoard.fqbn})`);
    setIsUploading(true);
    setUploadProgress(10);
    setActiveTab('console');

    try {
      setUploadProgress(30);
      const result = await compileArduinoCode(generatedCode, selectedBoard.fqbn);
      setUploadProgress(90);
      
      if (result.success) {
        if (result.hex) {
          setCompiledHex(result.hex);
          addConsoleMessage('success', '✓ ¡Compilación exitosa! Archivo HEX listo.');
        }
        if (result.output) {
          result.output.split('\n').forEach(line => {
            if (line.trim()) {
              addConsoleMessage('info', line);
            }
          });
        }
        toast.success('¡Compilación completada!');
      } else {
        setCompiledHex(null);
        addConsoleMessage('error', '✗ Error de compilación');
        if (result.error) {
          addConsoleMessage('error', result.error);
        }
        if (result.output) {
          result.output.split('\n').forEach(line => {
            if (line.trim()) {
              addConsoleMessage('warning', line);
            }
          });
        }
        toast.error('Error de compilación - revisa la consola');
      }
      setUploadProgress(100);
    } catch (error) {
      addConsoleMessage('error', `Error: ${error}`);
      toast.error('Error de compilación');
      setCompiledHex(null);
    } finally {
      setTimeout(() => setIsUploading(false), 500);
    }
  };

  const handleUpload = async () => {
    if (isConnected) {
      addConsoleMessage('info', 'Cerrando conexión serial...');
      setIsConnected(false);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    let hexToUpload = compiledHex;

    if (!hexToUpload) {
      addConsoleMessage('info', 'Compilando primero...');
      addConsoleMessage('info', '━━━ Iniciando compilación ━━━');
      addConsoleMessage('info', `Placa: ${selectedBoard.name} (${selectedBoard.fqbn})`);
      setIsUploading(true);
      setUploadProgress(10);
      setActiveTab('console');

      try {
        setUploadProgress(30);
        const result = await compileArduinoCode(generatedCode, selectedBoard.fqbn);
        setUploadProgress(90);
        
        if (result.success && result.hex) {
          hexToUpload = result.hex;
          setCompiledHex(result.hex);
          addConsoleMessage('success', '✓ ¡Compilación exitosa!');
          if (result.output) {
            result.output.split('\n').forEach(line => {
              if (line.trim()) addConsoleMessage('info', line);
            });
          }
        } else {
          setCompiledHex(null);
          addConsoleMessage('error', '✗ Error de compilación');
          if (result.error) addConsoleMessage('error', result.error);
          if (result.output) {
            result.output.split('\n').forEach(line => {
              if (line.trim()) addConsoleMessage('warning', line);
            });
          }
          toast.error('Error de compilación');
          setIsUploading(false);
          return;
        }
      } catch (error) {
        addConsoleMessage('error', `Error: ${error}`);
        toast.error('Error de compilación');
        setIsUploading(false);
        return;
      }
    }

    addConsoleMessage('info', '━━━ Subiendo a la placa ━━━');
    addConsoleMessage('info', `Destino: ${selectedBoard.name}`);
    if (!isUploading) setIsUploading(true);
    setActiveTab('console');

    try {
      const port = await requestSerialPort();
      if (!port) {
        addConsoleMessage('warning', 'Subida cancelada - sin puerto seleccionado');
        setIsUploading(false);
        return;
      }

      const hexData = parseHexFile(hexToUpload);
      addConsoleMessage('info', `Tamaño del firmware: ${hexData.length} bytes`);

      await uploadToArduino(
        port,
        hexData,
        selectedBoard,
        (progress) => {
          setUploadProgress(progress.progress);
          addConsoleMessage(
            progress.stage === 'error' ? 'error' : 'info',
            progress.message
          );
        },
        (debugMsg) => {
          addConsoleMessage('info', debugMsg);
        }
      );

      addConsoleMessage('success', '✓ ¡Subida completada!');
      toast.success('¡Programa subido correctamente!');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addConsoleMessage('error', `✗ Error de subida: ${errorMsg}`);
      toast.error('Error al subir');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleNewProject = () => {
    if (!newProjectName.trim()) {
      toast.error('Ingresa un nombre para el proyecto');
      return;
    }
    onNewProject(newProjectName);
    setNewProjectName('');
    setShowNewDialog(false);
  };

  // Export project to PC
  const handleExportToPC = async () => {
    const projectName = currentProject?.name || 'MiProyecto';
    
    // Get current Blockly XML from workspace
    const workspace = Blockly.getMainWorkspace();
    let blocklyXml = '';
    if (workspace) {
      const xml = Blockly.Xml.workspaceToDom(workspace);
      blocklyXml = Blockly.Xml.domToText(xml);
    }

    const success = await exportToFile(
      projectName,
      blocklyXml || currentProject?.blocklyXml || '',
      generatedCode,
      selectedBoard.fqbn
    );

    if (success) {
      toast.success('Proyecto exportado a PC');
      addConsoleMessage('success', `Proyecto "${projectName}" guardado en PC`);
    }
  };

  // Export as .ino file
  const handleExportAsIno = async () => {
    const projectName = currentProject?.name || 'MiProyecto';
    const success = await exportAsIno(generatedCode, projectName);
    
    if (success) {
      toast.success('Archivo .ino exportado');
      addConsoleMessage('success', `Código exportado como ${projectName}.ino`);
    }
  };

  // Import project from PC
  const handleImportFromPC = async () => {
    const file = await importFromFile();
    
    if (file) {
      onImportProject(file.blocklyXml, file.name, file.board);
      toast.success(`Proyecto "${file.name}" cargado`);
      addConsoleMessage('success', `Proyecto "${file.name}" importado desde PC`);
    }
  };

  return (
    <>
      <div className="toolbar-island flex items-center justify-between gap-2 w-full">
        {/* Logo, Project Name and View Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink min-w-0">
          <Header />

          {/* View Selector: only in mobile mode, next to project name */}
          {isMobile && activeTabMobile && onMobileTabChange && (() => {
            const mobileTabs = [
              { value: 'blocks', icon: Blocks, label: getTranslation(language, 'ui_blocks') },
              { value: 'code',   icon: Code,   label: getTranslation(language, 'ui_code') },
              { value: 'console',icon: Terminal,label: getTranslation(language, 'ui_console') },
              { value: 'serial', icon: Radio,  label: getTranslation(language, 'ui_serial') },
            ] as const;
            const active = mobileTabs.find(t => t.value === activeTabMobile) || mobileTabs[0];
            const ActiveIcon = active.icon;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-2 py-1.5 bg-card/70 hover:bg-card transition-colors rounded-xl border border-border/50 text-xs font-bold text-foreground shadow-sm flex-shrink-0">
                    <ActiveIcon className="w-3.5 h-3.5 text-primary" />
                    <span className="hidden min-[420px]:inline">{active.label}</span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-44 bg-card/95 backdrop-blur-md rounded-xl p-1 border-border/50 shadow-xl"
                  style={{ zIndex: 200 }}
                >
                  {mobileTabs.map((tab) => (
                    <DropdownMenuItem
                      key={tab.value}
                      onClick={() => onMobileTabChange(tab.value)}
                      className={`flex items-center gap-3 py-2.5 px-3 rounded-lg my-0.5 cursor-pointer ${
                        activeTabMobile === tab.value
                          ? 'bg-primary text-primary-foreground font-bold'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })()}
        </div>

        {/* Desktop Controls (visible on md+) */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          {/* Left Section - File Operations Grouped */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="clay-btn gap-2 text-xs font-bold">
                  <FolderOpen className="w-4 h-4 text-primary" />
                  <span>{getTranslation(language, 'ui_project')}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 ide-panel border-none p-2">
                <DropdownMenuItem onClick={() => setShowNewDialog(true)} className="rounded-xl font-medium cursor-pointer">
                  <FilePlus className="w-4 h-4 mr-2 text-primary" />
                  {getTranslation(language, 'ui_new')}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onSave} className="rounded-xl font-medium cursor-pointer">
                  <Save className="w-4 h-4 mr-2 text-success" />
                  {getTranslation(language, 'ui_save')}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Abrir Submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="rounded-xl font-medium cursor-pointer">
                    <FolderOpen className="w-4 h-4 mr-2 text-secondary" />
                    <span>{getTranslation(language, 'ui_open')}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent side="right" className="w-56 ide-panel border-none p-2">
                    <DropdownMenuItem onClick={handleImportFromPC} className="rounded-xl font-medium cursor-pointer">
                      <HardDrive className="w-4 h-4 mr-2 text-primary" />
                      {getTranslation(language, 'ui_open_pc')}
                    </DropdownMenuItem>
                    {projects.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-1 text-xs text-muted-foreground font-bold">{getTranslation(language, 'ui_recent')}</div>
                        {projects.slice(0, 5).map((project) => (
                          <DropdownMenuItem
                            key={project.id}
                            onClick={() => onOpenProject(project.id)}
                            className="rounded-xl font-medium cursor-pointer"
                          >
                            <span className="truncate">📁 {project.name}</span>
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Exportar Submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="rounded-xl font-medium cursor-pointer">
                    <Download className="w-4 h-4 mr-2 text-warning" />
                    <span>{getTranslation(language, 'ui_export')}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent side="right" className="w-56 ide-panel border-none p-2">
                    <DropdownMenuItem onClick={handleExportToPC} className="rounded-xl font-medium cursor-pointer">
                      <HardDrive className="w-4 h-4 mr-2 text-primary" />
                      {getTranslation(language, 'ui_save_pc')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportAsIno} className="rounded-xl font-medium cursor-pointer">
                      <FileCode className="w-4 h-4 mr-2 text-success" />
                      {getTranslation(language, 'ui_export_ino')}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dialog for creating a new project (opens programmatically) */}
            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
              <DialogContent className="ide-panel border-none">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black text-primary">{getTranslation(language, 'ui_new_project')}</DialogTitle>
                  <DialogDescription>
                    Crea un nuevo proyecto Arduino. Tu trabajo se guardará automáticamente.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="projectName" className="font-bold">{language === 'es' ? 'Nombre del Proyecto' : 'Project Name'}</Label>
                  <Input
                    id="projectName"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder={language === 'es' ? 'Mi Proyecto Arduino' : 'My Arduino Project'}
                    className="neu-input mt-2"
                    onKeyDown={(e) => e.key === 'Enter' && handleNewProject()}
                  />
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setShowNewDialog(false)} className="clay-btn">
                    {language === 'es' ? 'Cancelar' : 'Cancel'}
                  </Button>
                  <Button onClick={handleNewProject} className="clay-btn clay-btn-primary">
                    {language === 'es' ? 'Crear' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-border" />

          {/* Right Section - Hardware */}
          <div className="flex items-center gap-2">
            <Select
              value={selectedBoard.fqbn}
              onValueChange={(value) => {
                const board = ARDUINO_BOARDS.find(b => b.fqbn === value);
                if (board) setSelectedBoard(board);
              }}
            >
              <SelectTrigger className="neu-input w-[140px] sm:w-[160px] h-10 text-xs font-bold">
                <SelectValue placeholder="Seleccionar placa" />
              </SelectTrigger>
              <SelectContent className="ide-panel border-none">
                {ARDUINO_BOARDS.map((board) => (
                  <SelectItem key={board.fqbn} value={board.fqbn} className="font-medium rounded-lg">
                    {board.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              onClick={handleBuild}
              disabled={isUploading}
              className="clay-btn clay-btn-warning gap-2 text-xs"
            >
              <Hammer className="w-4 h-4" />
              <span className="hidden sm:inline">{getTranslation(language, 'ui_compile')}</span>
            </button>

            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="clay-btn clay-btn-primary gap-2 text-xs"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">{getTranslation(language, 'ui_upload')}</span>
            </button>
          </div>
        </div>

        {/* Responsive Mobile Menu (visible on mobile/tablet) */}
        <div className="md:hidden flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="clay-btn p-3 rounded-xl hover:bg-muted/80 text-foreground transition-all flex items-center justify-center min-h-[40px] min-w-[40px]">
                <Menu className="w-5 h-5 text-primary" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 ide-panel border-none p-2">
              
              {/* Proyecto Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="rounded-xl font-medium cursor-pointer">
                  <FolderOpen className="w-4 h-4 mr-2 text-primary" />
                  <span>{getTranslation(language, 'ui_project')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent side="left" className="w-56 ide-panel border-none p-2">
                  <DropdownMenuItem onClick={() => setShowNewDialog(true)} className="rounded-xl font-medium cursor-pointer">
                    <FilePlus className="w-4 h-4 mr-2 text-primary" />
                    {getTranslation(language, 'ui_new')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onSave} className="rounded-xl font-medium cursor-pointer">
                    <Save className="w-4 h-4 mr-2 text-success" />
                    {getTranslation(language, 'ui_save')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleImportFromPC} className="rounded-xl font-medium cursor-pointer">
                    <HardDrive className="w-4 h-4 mr-2 text-primary" />
                    {getTranslation(language, 'ui_open_pc')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportToPC} className="rounded-xl font-medium cursor-pointer">
                    <HardDrive className="w-4 h-4 mr-2 text-warning" />
                    {getTranslation(language, 'ui_save_pc')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportAsIno} className="rounded-xl font-medium cursor-pointer">
                    <FileCode className="w-4 h-4 mr-2 text-success" />
                    {getTranslation(language, 'ui_export_ino')}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Placa Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="rounded-xl font-medium cursor-pointer">
                  <Cpu className="w-4 h-4 mr-2 text-primary" />
                  <span className="truncate">{selectedBoard.name}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent side="left" className="w-56 ide-panel border-none p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {ARDUINO_BOARDS.map((board) => (
                    <DropdownMenuItem
                      key={board.fqbn}
                      onClick={() => setSelectedBoard(board)}
                      className={`rounded-xl font-medium cursor-pointer ${selectedBoard.fqbn === board.fqbn ? 'bg-primary/10 text-primary font-bold' : ''}`}
                    >
                      {board.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              {/* Hardware Actions */}
              <DropdownMenuItem onClick={handleBuild} disabled={isUploading} className="rounded-xl font-medium cursor-pointer text-warning">
                <Hammer className="w-4 h-4 mr-2" />
                {getTranslation(language, 'ui_compile')}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleUpload} disabled={isUploading} className="rounded-xl font-medium cursor-pointer text-primary">
                <Upload className="w-4 h-4 mr-2" />
                {getTranslation(language, 'ui_upload')}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Idioma Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="rounded-xl font-medium cursor-pointer">
                  <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{language === 'es' ? 'Idioma' : 'Language'}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent side="left" className="w-32 ide-panel border-none p-2">
                  <DropdownMenuItem onClick={() => setLanguage('en')} className="rounded-xl font-medium cursor-pointer">
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('es')} className="rounded-xl font-medium cursor-pointer">
                    Español
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dialog for creating a new project (opens programmatically) */}
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogContent className="ide-panel border-none">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-primary">{getTranslation(language, 'ui_new_project')}</DialogTitle>
                <DialogDescription>
                  Crea un nuevo proyecto Arduino. Tu trabajo se guardará automáticamente.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="projectName" className="font-bold">{language === 'es' ? 'Nombre del Proyecto' : 'Project Name'}</Label>
                <Input
                  id="projectName"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder={language === 'es' ? 'Mi Proyecto Arduino' : 'My Arduino Project'}
                  className="neu-input mt-2"
                  onKeyDown={(e) => e.key === 'Enter' && handleNewProject()}
                />
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowNewDialog(false)} className="clay-btn">
                  {language === 'es' ? 'Cancelar' : 'Cancel'}
                </Button>
                <Button onClick={handleNewProject} className="clay-btn clay-btn-primary">
                  {language === 'es' ? 'Crear' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div>
              <div className="flex items-center gap-3">
                <Progress value={uploadProgress} className="flex-1 h-2" />
                <span className="text-sm text-muted-foreground w-12">
                  {uploadProgress}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showNoSerialDialog} onOpenChange={setShowNoSerialDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              WebSerial No Soportado
            </DialogTitle>
            <DialogDescription className="pt-2">
              Tu navegador no soporta la API WebSerial, necesaria para conectar con placas Arduino.
              <br /><br />
              <strong>Para usar esta función:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Usa Google Chrome (versión 89+)</li>
                <li>Usa Microsoft Edge (versión 89+)</li>
                <li>Usa Opera (versión 75+)</li>
              </ul>
              <br />
              Safari, Firefox y navegadores móviles no son compatibles.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowNoSerialDialog(false)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Toolbar;
