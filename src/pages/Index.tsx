import React, { useState, useCallback, useRef, useEffect } from 'react';
import { IDEProvider, useIDE } from '@/contexts/IDEContext';
import BlocklyEditor from '@/components/BlocklyEditor';
import CodePanel from '@/components/CodePanel';
import ConsolePanel from '@/components/ConsolePanel';
import SerialMonitor from '@/components/SerialMonitor';
import Toolbar from '@/components/Toolbar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Code, Terminal, Radio, Blocks, Layers, ChevronRight, ChevronLeft } from 'lucide-react';
import { ImperativePanelHandle } from 'react-resizable-panels';
import * as Blockly from 'blockly';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { getTranslation } from '@/lib/i18n';

// Panel que permanece montado aunque no esté visible (visibility: hidden conserva
// su tamaño, el scroll y el estado interno, p. ej. la conexión del monitor serial).
const KeepAlivePane: React.FC<{ active: boolean; className?: string; children: React.ReactNode }> = ({
  active,
  className = '',
  children,
}) => (
  <div
    aria-hidden={!active}
    className={`absolute inset-0 transition-opacity duration-200 ${
      active ? 'opacity-100 visible z-10' : 'opacity-0 invisible pointer-events-none z-0'
    } ${className}`}
  >
    {children}
  </div>
);

const IDEContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab,
    saveProject,
    generatedCode,
    currentProject,
    openProject,
    createNewProject,
    addConsoleMessage,
    selectedBoard,
    importProject,
    language
  } = useIDE();
  
  const isMobile = useIsMobile();
  const [activeTabMobile, setActiveTabMobile] = useState<'blocks' | 'code' | 'console' | 'serial'>('blocks');
  const [blocklyKey, setBlocklyKey] = useState(0);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  
  useEffect(() => {
    const checkWorkspace = () => {
      const container = document.querySelector('.blockly-container');
      if (container) {
        const workspace = Blockly.getMainWorkspace() as Blockly.WorkspaceSvg;
        if (workspace) {
          workspaceRef.current = workspace;
        }
      }
    };
    
    const timer = setTimeout(checkWorkspace, 500);
    return () => clearTimeout(timer);
  }, [blocklyKey]);

  const getWorkspaceXml = useCallback((): string => {
    if (workspaceRef.current) {
      const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
      return Blockly.Xml.domToText(xml);
    }
    return '';
  }, []);

  const handleSave = useCallback(async () => {
    const xml = getWorkspaceXml();
    if (xml) {
      await saveProject(xml, generatedCode);
    }
  }, [getWorkspaceXml, saveProject, generatedCode]);

  const handleNewProject = useCallback(async (name: string) => {
    const xml = getWorkspaceXml() || '';
    await createNewProject(name, xml, generatedCode);
  }, [getWorkspaceXml, createNewProject, generatedCode]);

  const handleOpenProject = useCallback(async (id: string) => {
    await openProject(id);
    // Force re-render BlocklyEditor with new XML
    setBlocklyKey(prev => prev + 1);
    addConsoleMessage('info', 'Proyecto cargado correctamente');
  }, [openProject, addConsoleMessage]);

  const handleImportProject = useCallback(async (blocklyXml: string, name: string, board: string) => {
    await importProject(blocklyXml, name, board);
    // Force re-render BlocklyEditor with imported XML
    setBlocklyKey(prev => prev + 1);
  }, [importProject]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentProject) {
        handleSave();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [currentProject, handleSave]);

  // Sync context changes of activeTab to activeTabMobile (e.g. switching to console on compilation)
  useEffect(() => {
    if (activeTab === 'console' || activeTab === 'serial') {
      setActiveTabMobile(activeTab);
    }
  }, [activeTab]);

  const handleMobileTabChange = (tab: 'blocks' | 'code' | 'console' | 'serial') => {
    setActiveTabMobile(tab);
    if (tab !== 'blocks') {
      setActiveTab(tab);
    }
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-slate-100 flex flex-col">

        {/* NAVBAR - always on top, never overlapped */}
        <div className="w-full flex-shrink-0 z-50 relative px-1 pt-1">
          <Toolbar 
            onSave={handleSave}
            onNewProject={handleNewProject}
            onOpenProject={handleOpenProject}
            onImportProject={handleImportProject}
            activeTabMobile={activeTabMobile}
            onMobileTabChange={handleMobileTabChange}
          />
        </div>

        {/* CONTENT AREA - takes remaining height, fully clipped */}
        <div className="flex-1 min-h-0 px-1 pb-1 overflow-hidden relative">
          {/* Las 4 vistas quedan montadas y solo se ocultan: así no se pierden los bloques,
              la conexión serial ni lo escrito al cambiar de pestaña */}
          <KeepAlivePane active={activeTabMobile === 'blocks'} className="ide-panel overflow-hidden">
            <BlocklyEditor key={blocklyKey} initialXml={currentProject?.blocklyXml} />
          </KeepAlivePane>
          <KeepAlivePane active={activeTabMobile === 'code'} className="ide-panel overflow-hidden bg-card">
            <CodePanel />
          </KeepAlivePane>
          <KeepAlivePane active={activeTabMobile === 'console'} className="ide-panel overflow-hidden bg-card">
            <ConsolePanel />
          </KeepAlivePane>
          <KeepAlivePane active={activeTabMobile === 'serial'} className="ide-panel overflow-hidden bg-card">
            <SerialMonitor />
          </KeepAlivePane>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 flex flex-col">
      
      {/* TOOLBAR */}
      <div className="w-full relative z-20 mb-2 md:mb-4">
        <Toolbar 
          onSave={handleSave}
          onNewProject={handleNewProject}
          onOpenProject={handleOpenProject}
          onImportProject={handleImportProject}
        />
      </div>

      {/* WORK AREA */}
      <motion.div 
        className="flex-1 workspace-inset overflow-hidden relative mx-2 mb-2 md:mx-4 md:mb-4"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          
          {/* BLOCKLY PANEL */}
          <ResizablePanel defaultSize={60} minSize={35} className="p-2 sm:p-3">
            <div className="h-full w-full ide-panel overflow-hidden relative group">
              <BlocklyEditor key={blocklyKey} initialXml={currentProject?.blocklyXml} />
            </div>
          </ResizablePanel>

          {/* Handle */}
          <ResizableHandle 
            withHandle 
            className="bg-transparent w-5 group hover:bg-primary/10 transition-colors rounded-full mx-1" 
          />

          {/* CODE & CONSOLE PANEL */}
          <ResizablePanel 
            ref={rightPanelRef}
            defaultSize={40} 
            minSize={28} 
            collapsible={true}
            onCollapse={() => setIsRightPanelCollapsed(true)}
            onExpand={() => setIsRightPanelCollapsed(false)}
            className="p-2 sm:p-3 pl-0 sm:pl-0"
          >
            <div className="h-full w-full flex flex-col ide-panel overflow-hidden">
              
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full flex flex-col">
                
                {/* Tab Header */}
                <div className="px-3 pt-3 bg-gradient-to-b from-muted/30 to-transparent flex items-center justify-between gap-2">
                  <TabsList className="bg-transparent h-auto p-0 justify-start gap-1 flex-wrap flex-1">
                    {[
                      { value: 'code', icon: Code, label: getTranslation(language, 'ui_code'), color: 'primary' },
                      { value: 'console', icon: Terminal, label: getTranslation(language, 'ui_console'), color: 'warning' },
                      { value: 'serial', icon: Radio, label: getTranslation(language, 'ui_serial'), color: 'success' },
                    ].map((tab) => (
                      <TabsTrigger 
                        key={tab.value}
                        value={tab.value}
                        className={`tab-candy gap-2 data-[state=active]:text-${tab.color}`}
                      >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <button
                    onClick={() => rightPanelRef.current?.collapse()}
                    className="p-2 rounded-xl hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center"
                    title={getTranslation(language, 'ui_collapse')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden relative bg-card rounded-b-2xl">
                  {/* Las 3 pestañas quedan montadas y solo se ocultan: el monitor serial
                      sigue conectado y recibiendo aunque estés viendo Código o Consola */}
                  <KeepAlivePane active={activeTab === 'code'}>
                    <CodePanel />
                  </KeepAlivePane>
                  <KeepAlivePane active={activeTab === 'console'}>
                    <ConsolePanel />
                  </KeepAlivePane>
                  <KeepAlivePane active={activeTab === 'serial'}>
                    <SerialMonitor />
                  </KeepAlivePane>
                </div>
              </Tabs>

            </div>
          </ResizablePanel>

        </ResizablePanelGroup>

        {/* Floating Side Tab Strip when Collapsed */}
        {isRightPanelCollapsed && (
          <div className="absolute right-6 top-6 z-30 flex flex-col gap-2 p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200/80 dark:border-slate-800/80 shadow-2xl rounded-2xl animate-in fade-in slide-in-from-right-4 duration-300">
            {[
              { value: 'code', icon: Code, label: getTranslation(language, 'ui_code'), color: 'text-primary hover:bg-primary/10' },
              { value: 'console', icon: Terminal, label: getTranslation(language, 'ui_console'), color: 'text-warning hover:bg-warning/10' },
              { value: 'serial', icon: Radio, label: getTranslation(language, 'ui_serial'), color: 'text-success hover:bg-success/10' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value as any);
                  rightPanelRef.current?.expand();
                }}
                className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${tab.color}`}
                title={`${getTranslation(language, 'ui_expand')} ${tab.label}`}
              >
                <tab.icon className="w-5 h-5" />
              </button>
            ))}
            
            <div className="h-px bg-slate-200/80 dark:bg-slate-800/80 my-1 mx-1" />

            <button
              onClick={() => rightPanelRef.current?.expand()}
              className="p-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center justify-center"
              title={getTranslation(language, 'ui_expand')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </motion.div>

    </div>
  );
};

const Index: React.FC = () => {
  return (
    <IDEProvider>
      <IDEContent />
    </IDEProvider>
  );
};

export default Index;
