import React, { useState } from 'react';
import ReactModal from 'react-modal';
import { IconTrash } from '@tabler/icons';
import {
  BoardTheme,
  CustomFieldDefinition,
  CustomFieldType,
  EditorConfig,
  TagStyle,
} from '../../types/editor';

interface BoardSettingsModalProps {
  config: EditorConfig;
  /** Tags in use on cards (shown alongside configured tags) */
  knownTags: string[];
  saveConfig: (config: EditorConfig) => void;
  hideModal: () => void;
}

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    width: 'min(560px, 94vw)',
    maxHeight: '88vh',
    overflowY: 'auto' as const,
    backgroundColor: 'var(--sn-stylekit-contrast-background-color)',
    color: 'var(--sn-stylekit-contrast-foreground-color)',
    borderColor: 'var(--sn-stylekit-contrast-border-color)',
    borderWidth: '3px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
  },
};

const THEME_COLOR_KEYS: Array<{ key: keyof BoardTheme; label: string }> = [
  { key: 'background', label: 'Board background' },
  { key: 'foreground', label: 'Board text' },
  { key: 'laneBackground', label: 'Lane background' },
  { key: 'cardBackground', label: 'Card background' },
  { key: 'accent', label: 'Accent' },
];

const FIELD_TYPES: Array<{ value: CustomFieldType; label: string }> = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'card-ref', label: 'Card reference' },
];

export const BoardSettingsModal = ({
  config,
  knownTags,
  saveConfig,
  hideModal,
}: BoardSettingsModalProps) => {
  const [history, setHistory] = useState(Boolean(config.history));
  const [useCustomTheme, setUseCustomTheme] = useState(
    Boolean(config.theme && Object.keys(config.theme).length > 0)
  );
  const [theme, setTheme] = useState<BoardTheme>(config.theme ?? {});
  const [tags, setTags] = useState<Record<string, TagStyle>>(config.tags ?? {});
  const [fields, setFields] = useState<CustomFieldDefinition[]>(
    config.fields ?? []
  );
  const [newTagName, setNewTagName] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<CustomFieldType>('text');

  const save = () => {
    const newConfig: EditorConfig = {};
    if (history) {
      newConfig.history = true;
    }
    if (useCustomTheme && Object.keys(theme).length > 0) {
      newConfig.theme = theme;
    }
    if (Object.keys(tags).length > 0) {
      newConfig.tags = tags;
    }
    if (fields.length > 0) {
      newConfig.fields = fields;
    }
    saveConfig(newConfig);
    hideModal();
  };

  const setThemeColor = (key: keyof BoardTheme, value: string) => {
    setTheme({ ...theme, [key]: value });
  };

  const styledTagNames = Object.keys(tags);
  const unstyledTagNames = knownTags.filter(
    (name) => !styledTagNames.includes(name)
  );
  const allTagNames = [...styledTagNames, ...unstyledTagNames].sort((a, b) =>
    a.localeCompare(b)
  );

  const updateTagStyle = (name: string, changes: Partial<TagStyle>) => {
    const current = tags[name] ?? {};
    const updated = { ...current, ...changes };
    Object.keys(updated).forEach((key) => {
      if (updated[key] === undefined || updated[key] === false) {
        delete updated[key];
      }
    });
    setTags({ ...tags, [name]: updated });
  };

  const addTag = () => {
    const name = newTagName.trim();
    if (!name || tags[name]) {
      return;
    }
    setTags({ ...tags, [name]: {} });
    setNewTagName('');
  };

  const addField = () => {
    const name = newFieldName.trim();
    if (!name || fields.some((field) => field.name === name)) {
      return;
    }
    setFields([...fields, { name, type: newFieldType }]);
    setNewFieldName('');
    setNewFieldType('text');
  };

  return (
    <ReactModal isOpen onRequestClose={hideModal} style={customStyles}>
      <div className="card-modal board-settings">
        <h2>Board Settings</h2>

        <section>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={history}
              onChange={(e) => setHistory(e.target.checked)}
            />
            Track card history (created, moved, edited)
          </label>
        </section>

        <section>
          <h3>Colors</h3>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={!useCustomTheme}
              onChange={(e) => {
                setUseCustomTheme(!e.target.checked);
                if (e.target.checked) {
                  setTheme({});
                }
              }}
            />
            Use Standard Notes theme (default)
          </label>
          {useCustomTheme && (
            <div className="settings-theme-colors">
              {THEME_COLOR_KEYS.map(({ key, label }) => (
                <label className="modal-field" key={key}>
                  <span className="modal-field-name">{label}</span>
                  <input
                    type="color"
                    value={theme[key] ?? '#888888'}
                    onChange={(e) => setThemeColor(key, e.target.value)}
                  />
                  {theme[key] && (
                    <button
                      className="modal-icon-button"
                      title={`Reset ${label}`}
                      onClick={() => {
                        const { [key]: _, ...rest } = theme;
                        setTheme(rest);
                      }}
                    >
                      reset
                    </button>
                  )}
                </label>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3>Tags</h3>
          {allTagNames.length === 0 && (
            <p className="settings-hint">
              No tags yet. Add one below or tag a card from its details view.
            </p>
          )}
          {allTagNames.map((name) => {
            const style = tags[name];
            return (
              <div className="settings-tag-row" key={name}>
                <span
                  className="modal-tag"
                  style={{
                    backgroundColor:
                      style?.bgcolor ?? 'var(--sn-stylekit-info-color)',
                    color:
                      style?.color ?? 'var(--sn-stylekit-info-contrast-color)',
                    fontWeight: style?.bold ? 'bold' : undefined,
                  }}
                >
                  {name}
                </span>
                <label>
                  bg
                  <input
                    type="color"
                    value={style?.bgcolor ?? '#086dd6'}
                    onChange={(e) =>
                      updateTagStyle(name, { bgcolor: e.target.value })
                    }
                  />
                </label>
                <label>
                  text
                  <input
                    type="color"
                    value={style?.color ?? '#ffffff'}
                    onChange={(e) =>
                      updateTagStyle(name, { color: e.target.value })
                    }
                  />
                </label>
                <label className="settings-checkbox">
                  <input
                    type="checkbox"
                    checked={Boolean(style?.bold)}
                    onChange={(e) =>
                      updateTagStyle(name, {
                        bold: e.target.checked || undefined,
                      })
                    }
                  />
                  bold
                </label>
                {style && (
                  <button
                    className="modal-icon-button"
                    title={`Remove styling for ${name}`}
                    onClick={() => {
                      const { [name]: _, ...rest } = tags;
                      setTags(rest);
                    }}
                  >
                    <IconTrash size={14} stroke={1.5} />
                  </button>
                )}
              </div>
            );
          })}
          <div className="settings-add-row">
            <input
              placeholder="New tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <button onClick={addTag}>Add Tag</button>
          </div>
        </section>

        <section>
          <h3>Custom Fields</h3>
          <p className="settings-hint">
            Fields appear on every card's details view and are searchable.
          </p>
          {fields.map((field) => (
            <div className="settings-field-row" key={field.name}>
              <span className="modal-field-name">{field.name}</span>
              <select
                value={field.type}
                onChange={(e) =>
                  setFields(
                    fields.map((entry) =>
                      entry.name === field.name
                        ? { ...entry, type: e.target.value as CustomFieldType }
                        : entry
                    )
                  )
                }
              >
                {FIELD_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                className="modal-icon-button"
                title={`Remove field ${field.name}`}
                onClick={() =>
                  setFields(fields.filter((entry) => entry.name !== field.name))
                }
              >
                <IconTrash size={14} stroke={1.5} />
              </button>
            </div>
          ))}
          <div className="settings-add-row">
            <input
              placeholder="New field name"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addField();
                }
              }}
            />
            <select
              value={newFieldType}
              onChange={(e) =>
                setNewFieldType(e.target.value as CustomFieldType)
              }
            >
              {FIELD_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button onClick={addField}>Add Field</button>
          </div>
        </section>

        <footer className="modal-footer">
          <button className="modal-cancel-button" onClick={hideModal}>
            Cancel
          </button>
          <button className="modal-save-button" onClick={save}>
            Save Settings
          </button>
        </footer>
      </div>
    </ReactModal>
  );
};
