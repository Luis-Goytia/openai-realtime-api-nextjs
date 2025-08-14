"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { useTranslations } from "@/components/translations-context"
import { 
  Copy, 
  Clock, 
  Palette, 
  PartyPopper, 
  Globe, 
  Scissors, 
  Target, 
  FileText, 
  BarChart3, 
  Calendar 
} from "lucide-react"


export function ToolsEducation() {
  const { t } = useTranslations();

  const AVAILABLE_TOOLS = [
    {
      name: t('tools.availableTools.copyFn.name'),
      description: t('tools.availableTools.copyFn.description'),
      icon: Copy,
    },
    {
      name: t('tools.availableTools.getTime.name'),
      description: t('tools.availableTools.getTime.description'),
      icon: Clock,
    },
    {
      name: t('tools.availableTools.themeSwitcher.name'),
      description: t('tools.availableTools.themeSwitcher.description'),
      icon: Palette,
    },
    {
      name: t('tools.availableTools.partyMode.name'),
      description: t('tools.availableTools.partyMode.description'),
      icon: PartyPopper,
    },
    {
      name: t('tools.availableTools.launchWebsite.name'),
      description: t('tools.availableTools.launchWebsite.description'),
      icon: Globe,
    },
    {
      name: t('tools.availableTools.scrapeWebsite.name'),
      description: t('tools.availableTools.scrapeWebsite.description'),
      icon: Scissors,
    },
    {
      name: t('tools.availableTools.createCampaign.name'),
      description: t('tools.availableTools.createCampaign.description'),
      icon: Target,
    },
    {
      name: t('tools.availableTools.voiceNotes.name'),
      description: t('tools.availableTools.voiceNotes.description'),
      icon: FileText,
    },
    {
      name: t('tools.availableTools.generateReport.name'),
      description: t('tools.availableTools.generateReport.description'),
      icon: BarChart3,
    },
    {
      name: t('tools.availableTools.scheduleMeeting.name'),
      description: t('tools.availableTools.scheduleMeeting.description'),
      icon: Calendar,
    },
  ] as const;

  return (
    <div className="w-full max-w-lg mt-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="tools">
          <AccordionTrigger>{t('tools.availableTools.title')}</AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableBody>
                {AVAILABLE_TOOLS.map((tool) => {
                  const IconComponent = tool.icon;
                  return (
                    <TableRow key={tool.name}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {tool.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {tool.description}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
} 