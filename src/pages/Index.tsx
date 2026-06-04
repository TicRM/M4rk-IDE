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
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { getTranslation } from '@/lib/i18n';

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
          <AnimatePresence mode="wait">
            {activeTabMobile === 'blocks' && (
              <motion.div
                key="blocks"
                className="absolute inset-0 ide-panel overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
              >
                <BlocklyEditor key={blocklyKey} initialXml={currentProject?.blocklyXml} />
              </motion.div>
            )}
            {activeTabMobile === 'code' && (
              <motion.div
                key="code"
                className="absolute inset-0 ide-panel overflow-hidden bg-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
              >
                <CodePanel />
              </motion.div>
            )}
            {activeTabMobile === 'console' && (
              <motion.div
                key="console"
                className="absolute inset-0 ide-panel overflow-hidden bg-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
              >
                <ConsolePanel />
              </motion.div>
            )}
            {activeTabMobile === 'serial' && (
              <motion.div
                key="serial"
                className="absolute inset-0 ide-panel overflow-hidden bg-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
              >
                <SerialMonitor />
              </motion.div>
            )}
          </AnimatePresence>
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
                  <AnimatePresence mode="wait">
                    {activeTab === 'code' && (
                      <motion.div 
                        key="code"
                        className="h-full w-full"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CodePanel />
                      </motion.div>
                    )}
                    {activeTab === 'console' && (
                      <motion.div 
                        key="console"
                        className="h-full w-full"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ConsolePanel />
                      </motion.div>
                    )}
                    {activeTab === 'serial' && (
                      <motion.div 
                        key="serial"
                        className="h-full w-full"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <SerialMonitor />
                      </motion.div>
                    )}
                  </AnimatePresence>
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
