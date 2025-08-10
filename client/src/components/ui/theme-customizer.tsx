import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Settings, 
  Save, 
  RotateCcw, 
  Trash2, 
  Eye, 
  Moon, 
  Sun, 
  Monitor,
  Type,
  Circle,
  Square,
  Zap,
  X,
  Plus,
  Check
} from 'lucide-react';
import { useTheme, PredefinedTheme, ThemeConfig } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeCustomizer({ isOpen, onClose }: ThemeCustomizerProps) {
  const {
    currentTheme,
    availableThemes,
    setTheme,
    updateThemeProperty,
    resetToDefault,
    saveCustomTheme,
    deleteCustomTheme,
    isCustomTheme,
    themeName
  } = useTheme();

  const [activeTab, setActiveTab] = useState('presets');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);

  const handleColorChange = (property: keyof ThemeConfig, value: string) => {
    updateThemeProperty(property, value);
  };

  const handleSaveTheme = () => {
    if (saveName.trim()) {
      saveCustomTheme(saveName.trim(), saveDescription.trim());
      setSaveDialogOpen(false);
      setSaveName('');
      setSaveDescription('');
    }
  };

  const presetThemes = availableThemes.filter(t => !t.id.startsWith('custom-'));
  const customThemes = availableThemes.filter(t => t.id.startsWith('custom-'));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--theme-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--theme-text)]">Theme Customizer</h2>
                  <p className="text-sm text-[var(--theme-text-secondary)]">Personalize your experience</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {themeName}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)]"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex h-[calc(90vh-80px)]">
              {/* Main Panel */}
              <div className="flex-1 overflow-y-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                  <div className="p-6 pb-0">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="presets">Presets</TabsTrigger>
                      <TabsTrigger value="colors">Colors</TabsTrigger>
                      <TabsTrigger value="layout">Layout</TabsTrigger>
                      <TabsTrigger value="custom">Custom</TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-6">
                    {/* Presets Tab */}
                    <TabsContent value="presets" className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-4">Built-in Themes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {presetThemes.map((theme) => (
                            <motion.div
                              key={theme.id}
                              className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                theme.id === themeName ? 'border-[var(--theme-primary)]' : 'border-[var(--theme-border)]'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setTheme(theme)}
                              onMouseEnter={() => setPreviewTheme(theme.id)}
                              onMouseLeave={() => setPreviewTheme(null)}
                            >
                              <div className={`w-full h-16 rounded-lg bg-gradient-to-r ${theme.preview} mb-3`} />
                              <h4 className="font-semibold text-[var(--theme-text)]">{theme.name}</h4>
                              <p className="text-sm text-[var(--theme-text-secondary)]">{theme.description}</p>
                              {theme.id === themeName && (
                                <Check className="absolute top-2 right-2 w-5 h-5 text-[var(--theme-primary)]" />
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {customThemes.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-4">Custom Themes</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {customThemes.map((theme) => (
                              <motion.div
                                key={theme.id}
                                className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all group ${
                                  theme.id === themeName ? 'border-[var(--theme-primary)]' : 'border-[var(--theme-border)]'
                                }`}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setTheme(theme)}
                              >
                                <div className={`w-full h-16 rounded-lg bg-gradient-to-r ${theme.preview} mb-3`} />
                                <h4 className="font-semibold text-[var(--theme-text)]">{theme.name}</h4>
                                <p className="text-sm text-[var(--theme-text-secondary)]">{theme.description}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteCustomTheme(theme.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                {theme.id === themeName && (
                                  <Check className="absolute top-2 right-8 w-5 h-5 text-[var(--theme-primary)]" />
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* Colors Tab */}
                    <TabsContent value="colors" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-[var(--theme-text)]">Primary Colors</h3>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium text-[var(--theme-text)]">Primary</Label>
                              <div className="flex items-center gap-3 mt-1">
                                <Input
                                  type="color"
                                  value={currentTheme.primary}
                                  onChange={(e) => handleColorChange('primary', e.target.value)}
                                  className="w-12 h-8 p-0 border-0 rounded cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  value={currentTheme.primary}
                                  onChange={(e) => handleColorChange('primary', e.target.value)}
                                  className="flex-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-[var(--theme-text)]">Secondary</Label>
                              <div className="flex items-center gap-3 mt-1">
                                <Input
                                  type="color"
                                  value={currentTheme.secondary}
                                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                                  className="w-12 h-8 p-0 border-0 rounded cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  value={currentTheme.secondary}
                                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                                  className="flex-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-[var(--theme-text)]">Accent</Label>
                              <div className="flex items-center gap-3 mt-1">
                                <Input
                                  type="color"
                                  value={currentTheme.accent}
                                  onChange={(e) => handleColorChange('accent', e.target.value)}
                                  className="w-12 h-8 p-0 border-0 rounded cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  value={currentTheme.accent}
                                  onChange={(e) => handleColorChange('accent', e.target.value)}
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-[var(--theme-text)]">Surface Colors</h3>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium text-[var(--theme-text)]">Background</Label>
                              <div className="flex items-center gap-3 mt-1">
                                <Input
                                  type="color"
                                  value={currentTheme.background}
                                  onChange={(e) => handleColorChange('background', e.target.value)}
                                  className="w-12 h-8 p-0 border-0 rounded cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  value={currentTheme.background}
                                  onChange={(e) => handleColorChange('background', e.target.value)}
                                  className="flex-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-[var(--theme-text)]">Surface</Label>
                              <div className="flex items-center gap-3 mt-1">
                                <Input
                                  type="color"
                                  value={currentTheme.surface}
                                  onChange={(e) => handleColorChange('surface', e.target.value)}
                                  className="w-12 h-8 p-0 border-0 rounded cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  value={currentTheme.surface}
                                  onChange={(e) => handleColorChange('surface', e.target.value)}
                                  className="flex-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-[var(--theme-text)]">Border</Label>
                              <div className="flex items-center gap-3 mt-1">
                                <Input
                                  type="color"
                                  value={currentTheme.border}
                                  onChange={(e) => handleColorChange('border', e.target.value)}
                                  className="w-12 h-8 p-0 border-0 rounded cursor-pointer"
                                />
                                <Input
                                  type="text"
                                  value={currentTheme.border}
                                  onChange={(e) => handleColorChange('border', e.target.value)}
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Layout Tab */}
                    <TabsContent value="layout" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-[var(--theme-text)]">Appearance</h3>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium text-[var(--theme-text)]">Color Mode</Label>
                              <Select
                                value={currentTheme.mode}
                                onValueChange={(value) => updateThemeProperty('mode', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="light">
                                    <div className="flex items-center gap-2">
                                      <Sun className="w-4 h-4" />
                                      Light
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="dark">
                                    <div className="flex items-center gap-2">
                                      <Moon className="w-4 h-4" />
                                      Dark
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="auto">
                                    <div className="flex items-center gap-2">
                                      <Monitor className="w-4 h-4" />
                                      Auto
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-[var(--theme-text)]">Font Size</Label>
                              <Select
                                value={currentTheme.fontSize}
                                onValueChange={(value) => updateThemeProperty('fontSize', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="small">
                                    <div className="flex items-center gap-2">
                                      <Type className="w-3 h-3" />
                                      Small
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="medium">
                                    <div className="flex items-center gap-2">
                                      <Type className="w-4 h-4" />
                                      Medium
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="large">
                                    <div className="flex items-center gap-2">
                                      <Type className="w-5 h-5" />
                                      Large
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-[var(--theme-text)]">Design</h3>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium text-[var(--theme-text)]">Border Radius</Label>
                              <Select
                                value={currentTheme.borderRadius}
                                onValueChange={(value) => updateThemeProperty('borderRadius', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="sharp">
                                    <div className="flex items-center gap-2">
                                      <Square className="w-4 h-4" />
                                      Sharp
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="rounded">
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 border border-current rounded" />
                                      Rounded
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="pill">
                                    <div className="flex items-center gap-2">
                                      <Circle className="w-4 h-4" />
                                      Pill
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-[var(--theme-text)]">Animation</Label>
                              <Select
                                value={currentTheme.animation}
                                onValueChange={(value) => updateThemeProperty('animation', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="smooth">
                                    <div className="flex items-center gap-2">
                                      <Zap className="w-4 h-4" />
                                      Smooth
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="reduced">
                                    <div className="flex items-center gap-2">
                                      <Settings className="w-4 h-4" />
                                      Reduced
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="none">
                                    <div className="flex items-center gap-2">
                                      <X className="w-4 h-4" />
                                      None
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Custom Tab */}
                    <TabsContent value="custom" className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-[var(--theme-text)]">Save Custom Theme</h3>
                          <Button
                            onClick={() => setSaveDialogOpen(true)}
                            className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/90"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Theme
                          </Button>
                        </div>

                        {saveDialogOpen && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                Create Custom Theme
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <Label>Theme Name</Label>
                                <Input
                                  value={saveName}
                                  onChange={(e) => setSaveName(e.target.value)}
                                  placeholder="Enter theme name"
                                />
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Textarea
                                  value={saveDescription}
                                  onChange={(e) => setSaveDescription(e.target.value)}
                                  placeholder="Describe your theme"
                                  rows={3}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={handleSaveTheme} disabled={!saveName.trim()}>
                                  Save Theme
                                </Button>
                                <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                                  Cancel
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={resetToDefault}
                            className="flex-1"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset to Default
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>

              {/* Preview Panel */}
              <div className="w-80 border-l border-[var(--theme-border)] p-6">
                <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-[var(--theme-background)] border border-[var(--theme-border)]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)]" />
                      <div>
                        <h4 className="font-semibold text-[var(--theme-text)]">Preview Card</h4>
                        <p className="text-sm text-[var(--theme-text-secondary)]">Sample content</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-[var(--theme-primary)] rounded-full" style={{ width: '70%' }} />
                      <div className="h-2 bg-[var(--theme-secondary)] rounded-full" style={{ width: '50%' }} />
                      <div className="h-2 bg-[var(--theme-accent)] rounded-full" style={{ width: '80%' }} />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <div className="px-3 py-1 bg-[var(--theme-primary)] text-white text-sm rounded-full">Primary</div>
                      <div className="px-3 py-1 bg-[var(--theme-secondary)] text-white text-sm rounded-full">Secondary</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}