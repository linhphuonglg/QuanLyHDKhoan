import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Eraser,
  AlignJustify, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Indent, 
  Outdent, 
  List, 
  ListOrdered, 
  RotateCcw, 
  Code, 
  Eye, 
  Plus, 
  Sparkles, 
  Palette,
  Check,
  ChevronDown,
  Quote
} from 'lucide-react';

export interface WysiwygClauseEditorProps {
  clauseId: string;
  clauseNumber?: number | string;
  title: string;
  pageLabel?: string;
  value: string;
  defaultValue?: string;
  onChange: (newValue: string) => void;
  readOnly?: boolean;
  minHeight?: string;
  globalFormatting?: {
    textAlign?: 'justify' | 'left';
    lineHeight?: number;
    paragraphIndent?: number;
    fontSize?: number;
  };
}

export interface WysiwygClauseEditorRef {
  focus: () => void;
  scrollIntoView: () => void;
}

export const WysiwygClauseEditor = forwardRef<WysiwygClauseEditorRef, WysiwygClauseEditorProps>(({
  clauseId,
  clauseNumber,
  title,
  pageLabel,
  value,
  defaultValue,
  onChange,
  readOnly = false,
  minHeight = '130px',
  globalFormatting = {
    textAlign: 'justify',
    lineHeight: 1.45,
    paragraphIndent: 1.27,
    fontSize: 13,
  },
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtmlRef = useRef<string>(value);
  const isInternalChangeRef = useRef<boolean>(false);

  const [mode, setMode] = useState<'wysiwyg' | 'code'>('wysiwyg');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>('#0f172a');
  const [wordCount, setWordCount] = useState<number>(0);

  useImperativeHandle(ref, () => ({
    focus: () => {
      editorRef.current?.focus();
    },
    scrollIntoView: () => {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }));

  // Convert plain text with newlines to initial HTML paragraphs if it's not already HTML
  const formatInitialContent = (content: string): string => {
    if (!content) return '';
    // Check if it already contains block tags
    const hasBlockTags = /<(p|div|ul|ol|li|h[1-6]|table)[^>]*>/i.test(content);
    if (hasBlockTags) {
      return content;
    }
    // If it's plain text with line breaks, convert to <p>
    const lines = content.split('\n');
    return lines
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '<p><br></p>';
        if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('+')) {
          return `<p style="margin: 4px 0 4px 22px; text-indent: -12px; padding-left: 12px; text-align: ${globalFormatting.textAlign || 'justify'}; line-height: ${globalFormatting.lineHeight || 1.45};">${trimmed}</p>`;
        }
        if (/^[0-9]+\.\s/.test(trimmed)) {
          return `<p style="margin: 6px 0 4px 0; text-indent: ${globalFormatting.paragraphIndent || 1.27}cm; font-weight: 500; text-align: ${globalFormatting.textAlign || 'justify'}; line-height: ${globalFormatting.lineHeight || 1.45};">${trimmed}</p>`;
        }
        return `<p style="margin: 4px 0; text-indent: ${globalFormatting.paragraphIndent || 1.27}cm; text-align: ${globalFormatting.textAlign || 'justify'}; line-height: ${globalFormatting.lineHeight || 1.45};">${trimmed}</p>`;
      })
      .join('');
  };

  // Sync value from props to editor contentEditable
  useEffect(() => {
    if (!editorRef.current) return;
    
    // Only update innerHTML if change did NOT come from the user's own typing
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }

    const effectiveText = (value && value.trim()) ? value : (defaultValue || '');
    const htmlToSet = formatInitialContent(effectiveText);
    if (editorRef.current.innerHTML !== htmlToSet) {
      editorRef.current.innerHTML = htmlToSet;
      lastHtmlRef.current = htmlToSet;
      if (!value?.trim() && defaultValue) {
        onChange(htmlToSet);
      }
    }
    updateWordCount(editorRef.current.innerText || '');
  }, [value, defaultValue]);

  const updateWordCount = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setWordCount(0);
      return;
    }
    const words = trimmed.split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    lastHtmlRef.current = currentHtml;
    isInternalChangeRef.current = true;
    onChange(currentHtml);
    updateWordCount(editorRef.current.innerText || '');
  };

  const exec = (command: string, value: string | undefined = undefined) => {
    if (readOnly) return;
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  const applyAlignment = (align: 'justify' | 'left' | 'center' | 'right') => {
    if (readOnly) return;
    editorRef.current?.focus();
    switch (align) {
      case 'justify':
        document.execCommand('justifyFull', false);
        break;
      case 'left':
        document.execCommand('justifyLeft', false);
        break;
      case 'center':
        document.execCommand('justifyCenter', false);
        break;
      case 'right':
        document.execCommand('justifyRight', false);
        break;
    }
    handleInput();
  };

  const applyIndentFirstLine = () => {
    if (readOnly) return;
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    
    // Insert styled paragraph or apply text-indent
    const range = selection.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName.toLowerCase() === 'p') {
        const el = node as HTMLElement;
        el.style.textIndent = el.style.textIndent === '1.27cm' ? '0cm' : '1.27cm';
        handleInput();
        return;
      }
      node = node.parentNode;
    }
    // Fallback: execCommand indent
    document.execCommand('indent', false);
    handleInput();
  };

  const insertAdministrativeClause = (type: 'clause' | 'bullet' | 'subpoint') => {
    if (readOnly) return;
    editorRef.current?.focus();
    let snippet = '';
    const align = globalFormatting.textAlign || 'justify';
    const lh = globalFormatting.lineHeight || 1.45;
    const indent = `${globalFormatting.paragraphIndent || 1.27}cm`;

    if (type === 'clause') {
      snippet = `<p style="margin: 6px 0 4px 0; text-indent: ${indent}; font-weight: bold; text-align: ${align}; line-height: ${lh};">2. Nội dung tiếp theo: </p>`;
    } else if (type === 'bullet') {
      snippet = `<p style="margin: 4px 0 4px 22px; text-indent: -12px; padding-left: 12px; text-align: ${align}; line-height: ${lh};">- Ý chi tiết mới...</p>`;
    } else if (type === 'subpoint') {
      snippet = `<p style="margin: 4px 0 4px 24px; text-indent: -12px; padding-left: 12px; text-align: ${align}; line-height: ${lh};">a) Điểm quy định mới...</p>`;
    }

    document.execCommand('insertHTML', false, snippet);
    handleInput();
  };

  const handleResetToDefault = () => {
    if (!defaultValue) return;
    const formatted = formatInitialContent(defaultValue);
    if (editorRef.current) {
      editorRef.current.innerHTML = formatted;
    }
    lastHtmlRef.current = formatted;
    isInternalChangeRef.current = true;
    onChange(formatted);
    updateWordCount(defaultValue);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setShowColorPicker(false);
    exec('foreColor', color);
  };

  const colors = [
    { name: 'Đen hành chính', value: '#0f172a' },
    { name: 'Xanh Đường Sắt', value: '#0f5499' },
    { name: 'Đỏ chú ý', value: '#b91c1c' },
    { name: 'Xám chuẩn', value: '#475569' },
    { name: 'Xanh lá xác nhận', value: '#15803d' },
  ];

  return (
    <div 
      ref={containerRef}
      className="p-3.5 bg-white border border-slate-300 rounded-xl shadow-xs transition-all space-y-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
    >
      {/* Header Bar of this Clause */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {clauseNumber !== undefined && (
            <span className="w-5 h-5 rounded-full bg-[#0f5499] text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
              {clauseNumber}
            </span>
          )}
          <label className="text-xs font-bold text-slate-900 tracking-tight">
            {title}
          </label>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          {pageLabel && (
            <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              {pageLabel}
            </span>
          )}

          {defaultValue && !readOnly && (
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-medium text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded transition-colors cursor-pointer"
              title="Khôi phục lại nội dung mẫu biểu ban đầu của Điều này"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Mẫu gốc Điều này</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMode(mode === 'wysiwyg' ? 'code' : 'wysiwyg')}
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-medium rounded border transition-colors cursor-pointer ${
              mode === 'code' 
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
            }`}
            title={mode === 'wysiwyg' ? 'Chuyển sang chế độ xem/sửa mã HTML' : 'Chuyển sang chế độ soạn thảo trực quan WYSIWYG'}
          >
            {mode === 'wysiwyg' ? (
              <>
                <Code className="w-3 h-3" />
                <span className="hidden sm:inline">Mã HTML</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" />
                <span className="hidden sm:inline">WYSIWYG</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* WYSIWYG TOOLBAR (Only shown in WYSIWYG mode and editable) */}
      {!readOnly && mode === 'wysiwyg' && (
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-50/90 border border-slate-200 rounded-lg text-slate-700 select-none">
          {/* Bold, Italic, Underline, Strikethrough, Clear Formatting */}
          <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => exec('bold')}
              className="p-1 hover:bg-slate-100 rounded text-slate-700 hover:text-slate-900 cursor-pointer"
              title="In đậm (Bold - Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => exec('italic')}
              className="p-1 hover:bg-slate-100 rounded text-slate-700 hover:text-slate-900 cursor-pointer"
              title="In nghiêng (Italic - Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => exec('underline')}
              className="p-1 hover:bg-slate-100 rounded text-slate-700 hover:text-slate-900 cursor-pointer"
              title="Gạch chân (Underline - Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => exec('strikeThrough')}
              className="p-1 hover:bg-slate-100 rounded text-slate-700 hover:text-slate-900 cursor-pointer"
              title="Gạch ngang chữ (Strikethrough)"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => exec('removeFormat')}
              className="p-1 hover:bg-rose-50 text-slate-500 hover:text-rose-700 rounded cursor-pointer"
              title="Xóa định dạng (Clear formatting)"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 mx-0.5 hidden sm:block"></div>

          {/* Alignments: Justify, Left, Center, Right */}
          <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => applyAlignment('justify')}
              className="p-1 hover:bg-slate-100 rounded text-slate-700 hover:text-slate-900 cursor-pointer"
              title="Căn đều 2 bên (Justify - Chuẩn NĐ 30/2020)"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyAlignment('left')}
              className="p-1 hover:bg-slate-100 rounded text-slate-700 hover:text-slate-900 cursor-pointer"
              title="Căn lề trái"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyAlignment('center')}
              className="p-1 hover:bg-slate-100 rounded text-slate-700 hover:text-slate-900 cursor-pointer"
              title="Căn giữa"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyAlignment('right')}
              className="p-1 hover:bg-slate-100 rounded text-slate-700 hover:text-slate-900 cursor-pointer"
              title="Căn lề phải"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 mx-0.5 hidden sm:block"></div>

          {/* Indent & First Line Indent */}
          <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={applyIndentFirstLine}
              className="px-1.5 py-1 hover:bg-slate-100 rounded text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer flex items-center gap-1"
              title="Thụt đầu dòng đoạn văn 1.27 cm (Chuẩn văn bản)"
            >
              <Indent className="w-3.5 h-3.5" />
              <span className="text-[10px]">1.27cm</span>
            </button>
            <button
              type="button"
              onClick={() => exec('outdent')}
              className="p-1 hover:bg-slate-100 rounded text-slate-700 hover:text-slate-900 cursor-pointer"
              title="Giảm thụt lề"
            >
              <Outdent className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => exec('indent')}
              className="p-1 hover:bg-slate-100 rounded text-slate-700 hover:text-slate-900 cursor-pointer"
              title="Tăng thụt lề"
            >
              <Indent className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 mx-0.5 hidden sm:block"></div>

          {/* List formats */}
          <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => exec('insertUnorderedList')}
              className="p-1 hover:bg-slate-100 rounded text-slate-700 hover:text-slate-900 cursor-pointer"
              title="Danh sách gạch đầu dòng"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => exec('insertOrderedList')}
              className="p-1 hover:bg-slate-100 rounded text-slate-700 hover:text-slate-900 cursor-pointer"
              title="Danh sách đánh số"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Color Picker Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="inline-flex items-center gap-1 px-1.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-xs cursor-pointer shadow-2xs"
              title="Chọn màu chữ"
            >
              <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: selectedColor }}></span>
              <Palette className="w-3 h-3 text-slate-600" />
              <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
            </button>

            {showColorPicker && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-30 min-w-36 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase px-1 block">Màu chữ</span>
                {colors.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => handleColorSelect(c.value)}
                    className="w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between hover:bg-slate-100 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: c.value }}></span>
                      <span className="text-slate-700">{c.name}</span>
                    </div>
                    {selectedColor === c.value && <Check className="w-3 h-3 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fast Insert Administrative Snippets */}
          <div className="flex items-center gap-1 text-[11px] ml-auto">
            <button
              type="button"
              onClick={() => insertAdministrativeClause('clause')}
              className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded font-semibold cursor-pointer"
              title="Chèn khoản số mới (ví dụ: 2. Nội dung...)"
            >
              <Plus className="w-3 h-3" />
              <span>+ Khoản (2.)</span>
            </button>

            <button
              type="button"
              onClick={() => insertAdministrativeClause('bullet')}
              className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded font-semibold cursor-pointer"
              title="Chèn ý gạch đầu dòng mới (- )"
            >
              <Plus className="w-3 h-3" />
              <span>+ Ý (-)</span>
            </button>
          </div>
        </div>
      )}

      {/* EDITING SURFACE */}
      {mode === 'wysiwyg' ? (
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          onInput={handleInput}
          onBlur={handleInput}
          style={{
            minHeight,
            fontFamily: "'Times New Roman', 'Tinos', Times, Georgia, serif",
            fontSize: `${globalFormatting.fontSize || 13}pt`,
            lineHeight: globalFormatting.lineHeight || 1.45,
            textAlign: globalFormatting.textAlign || 'justify',
          }}
          className={`w-full p-3.5 bg-white border border-slate-300 rounded-lg outline-none leading-relaxed transition-all shadow-2xs font-serif ${
            readOnly ? 'bg-slate-50 cursor-not-allowed text-slate-700' : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900'
          }`}
          data-placeholder="Nội dung điều khoản..."
        />
      ) : (
        <textarea
          rows={6}
          value={value}
          readOnly={readOnly}
          onChange={(e) => {
            isInternalChangeRef.current = false;
            onChange(e.target.value);
            updateWordCount(e.target.value);
          }}
          style={{
            minHeight,
            fontFamily: "monospace",
            fontSize: '11.5px',
          }}
          className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg border border-slate-700 outline-none focus:ring-1 focus:ring-emerald-400"
          placeholder="Mã HTML hoặc nội dung văn bản..."
        />
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[10.5px] text-slate-400 px-1 pt-0.5">
        <span className="italic">
          {mode === 'wysiwyg' ? 'Soạn thảo trực quan WYSIWYG · Phông Times New Roman · Định dạng tự động xuất A4 & Word' : 'Chế độ chỉnh sửa trực tiếp mã HTML'}
        </span>
        <span className="font-mono">
          {wordCount} từ
        </span>
      </div>
    </div>
  );
});

WysiwygClauseEditor.displayName = 'WysiwygClauseEditor';
