import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Platform, Share, Switch, View } from 'react-native';

import { Button, Card, Chip, Input, Row, Screen, SectionHeader, T } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { BUILTIN_EXERCISES } from '@/data/exercises';
import { useTheme } from '@/hooks/use-theme';
import { fmtClock } from '@/lib/format';
import { confirm, notify } from '@/lib/ui';
import { useStore } from '@/store';

const RESTS = [30, 60, 90, 120, 180, 240];

export default function SettingsTab() {
  const theme = useTheme();
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  async function exportData() {
    const { settings, customExercises, templates, history } = useStore.getState();
    const json = JSON.stringify({ app: 'bicapp', version: 1, exportedAt: Date.now(), settings, customExercises, templates, history });
    if (Platform.OS === 'web') {
      const blob = new Blob([json], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `bicapp-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      return;
    }
    await Share.share({ message: json, title: 'Bicapp backup' });
  }

  async function importData() {
    try {
      const data = JSON.parse(importText);
      if (data.app !== 'bicapp') throw new Error('Not a Bicapp backup');
      if (!(await confirm('Import backup?', 'This replaces your templates, history and settings.', 'Import', true))) return;
      useStore.getState().importData(data);
      setImportText('');
      setShowImport(false);
      notify('Imported', `${data.history?.length ?? 0} workouts and ${data.templates?.length ?? 0} templates restored.`);
    } catch (e) {
      notify('Import failed', e instanceof Error ? e.message : 'Invalid file');
    }
  }

  const toggle = (label: string, value: boolean, onChange: (v: boolean) => void, hint?: string) => (
    <Row style={{ justifyContent: 'space-between' }}>
      <View style={{ flex: 1 }}>
        <T>{label}</T>
        {hint && <T variant="small" color="textSecondary">{hint}</T>}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: theme.accent }} />
    </Row>
  );

  return (
    <Screen>
      <SectionHeader title="Units" />
      <Card>
        <Row>
          <Chip label="Kilograms (kg)" active={settings.units === 'kg'} onPress={() => setSettings({ units: 'kg' })} />
          <Chip label="Pounds (lb)" active={settings.units === 'lb'} onPress={() => setSettings({ units: 'lb' })} />
        </Row>
        <T variant="small" color="textSecondary">Switching converts all your history — nothing is lost.</T>
      </Card>

      <SectionHeader title="Default rest timer" />
      <Card>
        <Row style={{ flexWrap: 'wrap' }}>
          {RESTS.map((r) => (
            <Chip key={r} label={fmtClock(r)} active={settings.defaultRestSec === r} onPress={() => setSettings({ defaultRestSec: r })} />
          ))}
        </Row>
      </Card>

      <SectionHeader title="During workouts" />
      <Card style={{ gap: Spacing.three }}>
        {toggle('Haptics', settings.haptics, (v) => setSettings({ haptics: v }), 'Vibrate on set complete and when rest ends')}
        {toggle('Keep screen awake', settings.keepAwake, (v) => setSettings({ keepAwake: v }))}
      </Card>

      <SectionHeader title="Your data" />
      <Card>
        <T variant="small" color="textSecondary">
          Everything is stored on this device only. Export a backup regularly.
        </T>
        <Button icon="download-outline" title="Export backup (JSON)" variant="secondary" onPress={exportData} />
        <Button icon="cloud-upload-outline" title="Import backup" variant="secondary" onPress={() => setShowImport((v) => !v)} />
        {showImport && (
          <>
            <Input multiline placeholder="Paste backup JSON here" value={importText} onChangeText={setImportText} style={{ minHeight: 100 }} />
            <Button title="Import" onPress={importData} disabled={!importText.trim()} />
          </>
        )}
        <Button
          icon="trash-outline"
          title="Erase all data"
          variant="danger"
          onPress={async () => {
            if (await confirm('Erase everything?', 'All workouts, templates and custom exercises will be deleted.', 'Erase', true)) {
              useStore.getState().resetAll();
            }
          }}
        />
      </Card>

      <SectionHeader title="About" />
      <Card>
        <T variant="subheading">Bicapp</T>
        <T variant="small" color="textSecondary">
          Free, open-source workout tracker. Unlimited templates, no accounts, no paywalls. MIT licensed.
        </T>
        <T variant="small" color="textSecondary">
          {BUILTIN_EXERCISES.length} exercises and images from Free Exercise DB (public domain).
        </T>
        <Button
          variant="ghost"
          size="sm"
          title="Free Exercise DB on GitHub"
          onPress={() => WebBrowser.openBrowserAsync('https://github.com/yuhonas/free-exercise-db')}
        />
      </Card>
    </Screen>
  );
}
