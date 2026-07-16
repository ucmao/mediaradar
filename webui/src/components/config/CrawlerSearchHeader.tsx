import { useState, KeyboardEvent } from 'react'
import {
  BookOpen,
  Music,
  Video,
  Tv,
  MessageCircle,
  MessagesSquare,
  HelpCircle,
  Search,
  Play,
  Square,
  X,
  Check,
  Zap,
  Globe,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCrawlerStore } from '@/store/crawlerStore'
import { usePlatforms, useStartCrawler, useStopCrawler } from '@/hooks/useCrawler'
import { toast } from 'sonner'

const ICON_MAP: { [key: string]: any } = {
  'book-open': BookOpen,
  'music': Music,
  'video': Video,
  'tv': Tv,
  'message-circle': MessageCircle,
  'messages-square': MessagesSquare,
  'help-circle': HelpCircle,
}

export function CrawlerSearchHeader() {
  const config = useCrawlerStore((state) => state.config)
  const updateConfig = useCrawlerStore((state) => state.updateConfig)
  const statuses = useCrawlerStore((state) => state.statuses)
  const selectedPlatforms = useCrawlerStore((state) => state.selectedPlatforms)
  const setSelectedPlatforms = useCrawlerStore((state) => state.setSelectedPlatforms)

  const { data: platforms } = usePlatforms()
  const { mutate: startCrawler } = useStartCrawler()
  const { mutate: stopCrawler } = useStopCrawler()

  const [inputValue, setInputValue] = useState('')

  // Keywords conversion
  const keywordsList = config.keywords
    ? config.keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : []

  const addKeyword = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    if (keywordsList.includes(trimmed)) {
      setInputValue('')
      return
    }
    const nextKeywords = [...keywordsList, trimmed].join(',')
    updateConfig({ keywords: nextKeywords })
    setInputValue('')
  }

  const removeKeyword = (keywordToRemove: string) => {
    const nextKeywords = keywordsList.filter((k) => k !== keywordToRemove).join(',')
    updateConfig({ keywords: nextKeywords })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addKeyword()
    }
  }

  const handlePlatformToggle = (platformVal: string) => {
    const isSelected = selectedPlatforms.includes(platformVal)
    let nextSelection: string[]
    if (isSelected) {
      nextSelection = selectedPlatforms.filter((p) => p !== platformVal)
    } else {
      nextSelection = [...selectedPlatforms, platformVal]
    }
    setSelectedPlatforms(nextSelection)
  }

  const isAnyRunning = Object.values(statuses).some((s) => s === 'running')
  const isAnyStopping = Object.values(statuses).some((s) => s === 'stopping')

  const handleStartAll = () => {
    // If input is not empty, commit it first
    let finalKeywords = config.keywords
    if (inputValue.trim()) {
      const trimmed = inputValue.trim()
      if (!keywordsList.includes(trimmed)) {
        finalKeywords = [...keywordsList, trimmed].join(',')
        updateConfig({ keywords: finalKeywords })
      }
      setInputValue('')
    }

    if (!finalKeywords && config.crawler_type === 'search') {
      toast.error('Please enter at least one keyword')
      return
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform')
      return
    }

    selectedPlatforms.forEach((p) => {
      if (statuses[p] !== 'running' && statuses[p] !== 'stopping') {
        startCrawler({
          ...config,
          platform: p,
          keywords: finalKeywords,
        })
      }
    })
  }

  const handleStopAll = () => {
    stopCrawler(undefined)
  }

  return (
    <div className="w-full rounded-xl glass-panel p-4 space-y-4 float-panel border border-cyber-border-subtle bg-cyber-bg-panel/40 relative overflow-hidden">
      {/* Background cyber accent line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyber-neon-cyan via-cyber-neon-purple to-cyber-neon-pink shadow-[0_0_8px_rgba(0,255,255,0.5)]" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-end">
        {/* Keyword Search Input Bar */}
        <div className="space-y-2">
          <label className="text-xs text-cyber-text-secondary font-mono tracking-wider flex items-center gap-1.5 uppercase">
            <Zap className="w-3.5 h-3.5 text-cyber-neon-cyan animate-pulse" />
            {config.crawler_type === 'search' ? 'Scan Target Keywords' : 'Scan Targets Configuration'}
          </label>
          
          {config.crawler_type === 'search' ? (
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-cyber-text-muted" />
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type keyword and press Enter or comma..."
                className="pl-12 pr-4 h-12 text-sm font-mono bg-cyber-bg-tertiary/20 border-cyber-border-default/60 focus:border-cyber-neon-cyan focus:ring-1 focus:ring-cyber-neon-cyan shadow-inner rounded-xl transition-all"
              />
            </div>
          ) : (
            <div className="h-12 flex items-center px-4 rounded-xl border border-dashed border-cyber-border-default/60 bg-cyber-bg-tertiary/10 text-xs font-mono text-cyber-text-muted">
              当前模式：{config.crawler_type === 'detail' ? '指定内容详情' : '创作者主页'}。请在下方统一采集参数中填写目标 ID。
            </div>
          )}

          {/* Keyword tags */}
          {config.crawler_type === 'search' && keywordsList.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {keywordsList.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyber-neon-cyan/10 border border-cyber-neon-cyan/30 text-cyber-neon-cyan text-xs font-mono font-medium shadow-glow-cyan-xs animate-fade-in"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeKeyword(tag)}
                    className="hover:text-cyber-neon-pink transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Global Controls */}
        <div className="flex gap-3">
          {isAnyRunning ? (
            <Button
              onClick={handleStopAll}
              disabled={isAnyStopping}
              className="h-12 px-8 bg-cyber-neon-pink text-white font-mono font-bold text-sm tracking-widest rounded-xl hover:bg-cyber-neon-pink/90 hover:shadow-glow-pink-sm transition-all flex items-center gap-2"
            >
              <Square className="w-4 h-4 fill-white" />
              {isAnyStopping ? 'STOPPING...' : 'TERMINATE SCAN'}
            </Button>
          ) : (
            <Button
              onClick={handleStartAll}
              disabled={selectedPlatforms.length === 0}
              className="h-12 px-8 bg-cyber-neon-cyan text-cyber-bg-primary font-mono font-bold text-sm tracking-widest rounded-xl hover:bg-cyber-neon-cyan/90 hover:shadow-glow-cyan-sm transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-cyber-bg-primary" />
              INITIATE SCAN
            </Button>
          )}
        </div>
      </div>

      {/* Platforms Multi-Select Cards */}
      <div className="space-y-2.5">
        <label className="text-xs text-cyber-text-secondary font-mono tracking-wider uppercase">
          Target Media Channels (Multi-select)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {platforms?.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform.value);
            const isRunning = statuses[platform.value] === 'running';
            const IconComponent = ICON_MAP[platform.icon] || Globe;

            return (
              <button
                key={platform.value}
                type="button"
                onClick={() => handlePlatformToggle(platform.value)}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-300 font-mono select-none ${
                  isSelected
                    ? 'bg-cyber-neon-cyan/5 border-cyber-neon-cyan/60 text-cyber-text-primary shadow-glow-cyan-xs'
                    : 'bg-cyber-bg-tertiary/10 border-cyber-border-subtle/50 text-cyber-text-muted hover:border-cyber-border-default/80 hover:text-cyber-text-secondary'
                }`}
              >
                {/* Active check indicator */}
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-cyber-neon-cyan text-cyber-bg-primary rounded-full flex items-center justify-center text-[10px] font-bold">
                    <Check className="w-2.5 h-2.5 stroke-[3px]" />
                  </span>
                )}

                {/* Running status blinker */}
                {isRunning && (
                  <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 bg-cyber-neon-green rounded-full shadow-glow-green-sm animate-pulse-fast" />
                )}

                <IconComponent className={`w-5 h-5 mb-1.5 transition-transform duration-300 ${isSelected ? 'text-cyber-neon-cyan scale-110' : 'text-cyber-text-muted'}`} />
                <span className="text-xs font-semibold">{platform.label}</span>
                
                {/* Micro-status label */}
                {isRunning && (
                  <span className="text-[9px] text-cyber-neon-green mt-1 font-bold tracking-tighter uppercase animate-pulse">Running</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
