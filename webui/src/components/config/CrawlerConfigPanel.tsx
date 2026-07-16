import type { ComponentType, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Database, KeyRound, MessageSquare, ShieldAlert } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useCrawlerStore } from '@/store/crawlerStore'
import { useConfigOptions } from '@/hooks/useCrawler'
import { ParsedIdList } from './ParsedIdList'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

type SectionProps = {
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
  children: ReactNode
  className?: string
  compact?: boolean
}

function Section({ title, description, icon: Icon, children, className = '', compact = false }: SectionProps) {
  return (
    <section className={`rounded-xl glass-panel float-panel overflow-hidden border border-cyber-border-subtle/50 bg-cyber-bg-panel/20 ${className}`}>
      <header className={`${compact ? 'px-3 py-2 gap-2' : 'px-4 py-3 gap-3'} border-b border-cyber-border-subtle/40 flex items-center bg-cyber-bg-tertiary/20`}>
        <div className={`${compact ? 'h-7 w-7' : 'h-8 w-8'} rounded-md bg-cyber-bg-tertiary/50 border border-cyber-border-subtle/60 flex items-center justify-center flex-shrink-0`}>
          <Icon className="h-4 w-4 text-cyber-neon-cyan" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-mono font-semibold text-cyber-text-primary tracking-wide">
            {title}
          </div>
          <div className="text-[10px] text-cyber-text-muted leading-snug truncate">
            {description}
          </div>
        </div>
      </header>
      <div className={compact ? 'p-3 space-y-3' : 'p-4 space-y-4'}>
        {children}
      </div>
    </section>
  )
}

type FieldProps = {
  label: string
  hint?: string
  children: ReactNode
}

function Field({ label, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="space-y-0.5">
        <Label className="text-xs text-cyber-text-secondary font-mono">
          {label}
        </Label>
        {hint ? (
          <p className="text-[9px] text-cyber-text-muted leading-snug">
            {hint}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export function CrawlerConfigPanel() {
  const { t } = useTranslation('config')
  const config = useCrawlerStore((state) => state.config)
  const updateConfig = useCrawlerStore((state) => state.updateConfig)
  const statuses = useCrawlerStore((state) => state.statuses)
  const activePlatformTab = useCrawlerStore((state) => state.activePlatformTab)

  const { data: options } = useConfigOptions()

  const isDisabled = Object.values(statuses).some((s) => s === 'running' || s === 'stopping')

  return (
    <div className="h-full min-h-0 flex flex-col gap-3 overflow-hidden pr-1">
      {/* Advanced Parameters Label */}
      <div className="flex-shrink-0 flex items-center gap-2 px-1 text-cyber-text-secondary font-mono text-xs uppercase tracking-wider">
        <ShieldAlert className="w-4 h-4 text-cyber-neon-purple animate-pulse" />
        Advanced Config ({activePlatformTab.toUpperCase()})
      </div>

      <Tabs defaultValue="execution" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid grid-cols-3 mb-2 flex-shrink-0 h-9 p-0.5 bg-cyber-bg-tertiary/60 border-cyber-border-subtle/50">
          <TabsTrigger value="execution" className="text-xs py-1">运行设置</TabsTrigger>
          <TabsTrigger value="auth" className="text-xs py-1">登录配置</TabsTrigger>
          <TabsTrigger value="extraction" className="text-xs py-1">提取参数</TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
          <TabsContent value="execution" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0">
            {/* Target & Mode Section */}
            <Section
              title="Execution Settings"
              description="Configure crawling parameters and source parameters"
              icon={Database}
            >
              <div className="grid grid-cols-2 gap-3">
                <Field label={t('field.crawlType')}>
                  <Select
                    value={config.crawler_type}
                    onValueChange={(value) => updateConfig({ crawler_type: value })}
                    disabled={isDisabled}
                  >
                    <SelectTrigger className="h-9 text-xs font-mono">
                      <SelectValue placeholder={t('field.crawlTypePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="font-mono text-xs">
                      {options?.crawler_types.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label={t('field.startPage')}>
                  <Input
                    type="number"
                    min={1}
                    value={config.start_page}
                    onChange={(e) => updateConfig({ start_page: parseInt(e.target.value) || 1 })}
                    disabled={isDisabled}
                    className="h-9 text-xs font-mono"
                  />
                </Field>
              </div>

              {/* Conditionally display specified inputs based on crawler type */}
              {config.crawler_type === 'detail' && (
                <Field label={t('field.specifiedIds')} hint={t('field.specifiedIdsHint')}>
                  <textarea
                    value={config.specified_ids}
                    onChange={(e) => updateConfig({ specified_ids: e.target.value })}
                    disabled={isDisabled}
                    placeholder={t(`field.specifiedIdsPlaceholder.${activePlatformTab}`, t('field.specifiedIdsPlaceholder.default'))}
                    className="min-h-[100px] w-full rounded-md border border-cyber-border-default bg-cyber-bg-tertiary/20 px-3 py-2 text-xs font-mono text-cyber-text-primary placeholder:text-cyber-text-muted focus-visible:outline-none focus-visible:border-cyber-neon-cyan/50 focus-visible:shadow-cyber-soft disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
                  />
                  <ParsedIdList
                    value={config.specified_ids}
                    platform={activePlatformTab}
                    type="detail"
                    disabled={isDisabled}
                  />
                  {activePlatformTab === 'xhs' && (
                    <div className="mt-2 rounded-lg border border-cyber-neon-orange/30 bg-cyber-neon-orange/5 p-2 text-[10px] leading-snug text-cyber-neon-orange font-mono">
                      {t('warning.xhsToken')}
                    </div>
                  )}
                </Field>
              )}

              {config.crawler_type === 'creator' && (
                <Field label={t('field.creatorIds')} hint={t('field.creatorIdsHint')}>
                  <textarea
                    value={config.creator_ids}
                    onChange={(e) => updateConfig({ creator_ids: e.target.value })}
                    disabled={isDisabled}
                    placeholder={t(`field.creatorIdsPlaceholder.${activePlatformTab}`, t('field.creatorIdsPlaceholder.default'))}
                    className="min-h-[100px] w-full rounded-md border border-cyber-border-default bg-cyber-bg-tertiary/20 px-3 py-2 text-xs font-mono text-cyber-text-primary placeholder:text-cyber-text-muted focus-visible:outline-none focus-visible:border-cyber-neon-cyan/50 focus-visible:shadow-cyber-soft disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
                  />
                  <ParsedIdList
                    value={config.creator_ids}
                    platform={activePlatformTab}
                    type="creator"
                    disabled={isDisabled}
                  />
                  {activePlatformTab === 'xhs' && (
                    <div className="mt-2 rounded-lg border border-cyber-neon-orange/30 bg-cyber-neon-orange/5 p-2 text-[10px] leading-snug text-cyber-neon-orange font-mono">
                      {t('warning.xhsToken')}
                    </div>
                  )}
                </Field>
              )}
            </Section>
          </TabsContent>

          <TabsContent value="auth" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0">
            {/* Authentication Section */}
            <Section
              title={t('section.authMatrix.title')}
              description={t('section.authMatrix.description')}
              icon={KeyRound}
              compact
            >
              <Field label={t('field.loginMethod')}>
                <Select
                  value={config.login_type}
                  onValueChange={(value) => updateConfig({ login_type: value })}
                  disabled={isDisabled}
                >
                  <SelectTrigger className="h-9 text-xs font-mono">
                    <SelectValue placeholder={t('field.loginMethodPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="font-mono text-xs">
                    {options?.login_types.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {config.login_type === 'cookie' ? (
                <Field label={t('field.cookies')} hint={t('field.cookiesHint')}>
                  <textarea
                    value={config.cookies}
                    onChange={(e) => updateConfig({ cookies: e.target.value })}
                    disabled={isDisabled}
                    placeholder={t('field.cookiesPlaceholder')}
                    className="min-h-[100px] w-full rounded-md border border-cyber-border-default bg-cyber-bg-tertiary/20 px-3 py-2 text-xs font-mono text-cyber-text-primary placeholder:text-cyber-text-muted focus-visible:outline-none focus-visible:border-cyber-neon-cyan/50 focus-visible:shadow-cyber-soft disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
                  />
                </Field>
              ) : null}

              {config.login_type === 'cookie' && (activePlatformTab === 'xhs' || activePlatformTab === 'dy') ? (
                <div className="rounded-lg border border-cyber-neon-orange/30 bg-cyber-neon-orange/5 p-3 text-[11px] leading-snug text-cyber-neon-orange font-mono">
                  {t('warning.cookieSlider')}
                </div>
              ) : null}
            </Section>
          </TabsContent>

          <TabsContent value="extraction" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0">
            {/* Comment Collection & Headless Settings */}
            <Section
              title="Extraction Parameters"
              description="Choose output metrics and browser display options"
              icon={Database}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-lg border border-cyber-border-subtle bg-cyber-bg-tertiary/10 p-2.5 hover:border-cyber-border-default transition-colors">
                  <Checkbox
                    checked={config.enable_comments}
                    onCheckedChange={(checked) => {
                      const isChecked = checked === true
                      updateConfig({
                        enable_comments: isChecked,
                        enable_sub_comments: isChecked ? config.enable_sub_comments : false,
                      })
                    }}
                    disabled={isDisabled}
                  />
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-cyber-text-secondary" />
                    <p className="text-xs font-mono text-cyber-text-primary">{t('field.commentExtraction')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-cyber-border-subtle bg-cyber-bg-tertiary/10 p-2.5 hover:border-cyber-border-default transition-colors">
                  <Checkbox
                    checked={config.enable_sub_comments}
                    onCheckedChange={(checked) => updateConfig({ enable_sub_comments: checked === true })}
                    disabled={isDisabled || !config.enable_comments}
                  />
                  <p className="text-xs font-mono text-cyber-text-primary">{t('field.subComments')}</p>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-cyber-border-subtle bg-cyber-bg-tertiary/10 p-2.5 hover:border-cyber-border-default transition-colors">
                  <Checkbox
                    checked={config.headless}
                    onCheckedChange={(checked) => updateConfig({ headless: checked === true })}
                    disabled={isDisabled}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono text-cyber-text-primary">{t('field.headlessMode')}</p>
                    <p className="text-[10px] text-cyber-text-muted leading-snug">
                      {t('field.headlessModeHint')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-cyber-border-subtle bg-cyber-bg-tertiary/10 p-2.5 hover:border-cyber-border-default transition-colors">
                  <Checkbox
                    checked={config.loop_execution}
                    onCheckedChange={(checked) => updateConfig({ loop_execution: checked === true })}
                    disabled={isDisabled}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono text-cyber-text-primary">Continuous Loop Mode (循环执行)</p>
                    <p className="text-[10px] text-cyber-text-muted leading-snug">
                      Automatically restart execution after a cycle ends to monitor targets continuously.
                    </p>
                  </div>
                </div>
              </div>
            </Section>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
