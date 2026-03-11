import { message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { Flex, Typography, Tag, Card, Input, Button, Row, Col, Tooltip, Tabs, Checkbox } from 'antd';
import { CloseOutlined, SearchOutlined, WarningOutlined, PlusOutlined } from '@ant-design/icons';
import { useVtagStore } from '../../store/vtagStore';
import { FormulaToken, TokenType } from '../../types/vtagConfig';
import { draggable, dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import invariant from 'tiny-invariant';

const { Text, Title } = Typography;

// -- MOCK DATA --
const MOCK_PTAGS: Omit<FormulaToken, 'id'>[] = [
  { type: 'ptag', value: 'PTAG_E_001', label: 'Main Chiller PTAG', level: 0 },
  { type: 'ptag', value: 'PTAG_W_002', label: 'Water Pump PTAG', level: 0 },
  { type: 'ptag', value: 'PTAG_L_003', label: 'Lobby Lights PTAG', level: 0 },
  { type: 'ptag', value: 'PTAG_H_004', label: 'HVAC Air PTAG', level: 0 },
  { type: 'vtag', value: 'VTAG_BLD_A', label: 'Building A Total (v1)', level: 1 },
];

const OPERATORS_AND_CONDITIONS: Omit<FormulaToken, 'id'>[] = [
  { type: 'operator', value: '+', label: '+' },
  { type: 'operator', value: '-', label: '-' },
  { type: 'operator', value: '*', label: '' },
  { type: 'operator', value: '/', label: '' },
  { type: 'operator', value: '(', label: '(' },
  { type: 'operator', value: ')', label: ')' },
  { type: 'operator', value: ',', label: ',' },
  { type: 'conditional', value: 'if', label: 'IF' },
  { type: 'conditional', value: 'and', label: 'AND' },
  { type: 'conditional', value: 'or', label: 'OR' },
  { type: 'conditional', value: '>', label: '>' },
  { type: 'conditional', value: '<', label: '<' },
  { type: 'conditional', value: '=', label: '=' },
  { type: 'conditional', value: '>=', label: '>=' },
  { type: 'conditional', value: '<=', label: '<=' },
];

const getColorForType = (type: TokenType) => {
  switch (type) {
    case 'ptag': return 'blue';
    case 'vtag': return 'purple';
    case 'operator': return 'warning';
    case 'conditional': return 'error';
    case 'number': return 'success';
    default: return 'default';
  }
};

const PaletteItem = ({ token }: { token: Omit<FormulaToken, 'id'> }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
    const currentVtagName = useVtagStore(state => state.config.name);
    const isOwnVtag = token.type === 'vtag' && (token.value === currentVtagName || token.label === currentVtagName);

  useEffect(() => {
    invariant(ref.current);
    if (isOwnVtag) return () => {};
      return draggable({
      element: ref.current,
      getInitialData: () => ({ isPaletteItem: true, tokenData: token }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [token]);

  return (
    <div ref={ref} style={{ opacity: isOwnVtag ? 0.5 : (isDragging ? 0.4 : 1), cursor: 'grab' }}>
      <Tag 
        color={getColorForType(token.type)} 
        style={{ fontWeight: 600, borderRadius: '4px', padding: '4px 8px', fontSize: '14px', margin: 0 }}
      >
        {token.label || token.value}
      </Tag>
    </div>
  );
};

const PtagListItem = ({ token, isSelected, onToggle, onQuickAdd, dragPayload }: { token: Omit<FormulaToken, 'id'>, isSelected?: boolean, onToggle?: (checked: boolean) => void, onQuickAdd?: () => void, dragPayload?: any }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const currentVtagName = useVtagStore(state => state.config.name);
  const isOwnVtag = token.type === 'vtag' && (token.value === currentVtagName || token.label === currentVtagName);

  useEffect(() => {
    invariant(ref.current);
    if (isOwnVtag) return () => {};
    return draggable({
      element: ref.current,
      getInitialData: () => ({ isPaletteItem: true, tokenData: dragPayload || token }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [token, isOwnVtag, dragPayload]);

  // Format the display label and description as requested
  let displayLabel = token.label;
  let displayDesc = token.value;

  if (token.label && token.label.includes('\\')) {
    const parts = token.label.split('\\');
    if (parts.length >= 2) {
      // Header shows only the last two parts
      displayLabel = parts.slice(-2).join('\\');
      // Description shows everything except first and last two
      displayDesc = parts.slice(1, -2).join('\\') || parts[0];
    }
  }

  const isVtag = token.type === 'vtag';

  return (
    <Tooltip title={token.label} placement="right">
      <Card
        ref={ref}
        size="small"
        style={{
          marginBottom: 8,
          cursor: isOwnVtag ? 'not-allowed' : 'grab',
          opacity: isOwnVtag ? 0.5 : (isDragging ? 0.4 : 1),
          borderColor: isSelected ? '#1677ff' : (isVtag ? '#d3adf7' : '#91caff'),
          borderLeft: '4px solid',
          borderLeftColor: isVtag ? '#722ed1' : '#1677ff',
          backgroundColor: isSelected ? '#e6f4ff' : 'white'
        }}
        styles={{ body: { padding: '12px' } }}
        hoverable
        onClick={() => onToggle && onToggle(!isSelected)}
      >
        <Flex align="center" gap={8}>
          {onToggle && (
            <Checkbox 
              checked={isSelected}
              onChange={(e) => onToggle(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong style={{ color: isVtag ? '#722ed1' : '#1677ff', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayLabel}
            </Text>
            <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayDesc}
            </Text>
          </div>
          {onQuickAdd && (
            <Button 
              type="text" 
              icon={<PlusOutlined />} 
              size="small" 
              onClick={(e) => { e.stopPropagation(); onQuickAdd(); }}
              title="Add this tag"
            />
          )}
        </Flex>
      </Card>
    </Tooltip>
  );
};
const FormulaItem = ({ token, index }: { token: FormulaToken, index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { removeToken } = useVtagStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    invariant(ref.current);
    const dropCleanup = dropTargetForElements({
      element: ref.current,
      getData: () => ({ index, isFormulaItemArea: true }),
      onDragEnter: () => setIsDragOver(true),
      onDragLeave: () => setIsDragOver(false),
      onDrop: () => setIsDragOver(false),
    });

    const dragCleanup = draggable({
      element: ref.current,
      getInitialData: () => ({ isExistingItem: true, index, tokenData: token }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });

    return () => {
      dropCleanup();
      dragCleanup();
    };
  }, [index, token]);

  // Format short label for the formula block
  let displayLabel = token.label || token.value;
  if (token.type === 'ptag' || token.type === 'vtag') {
    if (displayLabel && displayLabel.includes('\\')) {
      const parts = displayLabel.split('\\');
      if (parts.length >= 2) {
        displayLabel = parts.slice(-2).join('\\');
      }
    }
  }

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px',
        borderLeft: isDragOver ? '3px solid #1677ff' : '3px solid transparent',
        opacity: isDragging ? 0.4 : 1,
        transition: 'all 0.2s',
        marginLeft: '4px'
      }}
    >
      <Tooltip title={token.label}>
        <Tag
          color={getColorForType(token.type)}
          closable
          onClose={() => removeToken(token.id)}
          style={{ fontSize: '16px', padding: '6px 10px', borderRadius: '4px', margin: 0, display: 'flex', alignItems: 'center' }}
          closeIcon={<CloseOutlined />}
        >
          {displayLabel}
        </Tag>
      </Tooltip>
    </div>
  );
};

// Helper to validate the formula syntax
export const checkFormulaValidity = (tokens: FormulaToken[]): { valid: boolean; message: string } => {
  if (tokens.length === 0) return { valid: true, message: 'Formula is empty.' }; // Empty is okay for drafting

  let openParens = 0;
  let functionStack: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const prev = tokens[i - 1];

    const valStr = String(token.value).toUpperCase();
    const isTokenVal = token.type === 'ptag' || token.type === 'vtag' || token.type === 'number';
    const isTokenMathOp = ['+', '-', '*', '/'].includes(valStr);
    const isTokenCondOp = ['>', '<', '=', '>=', '<='].includes(valStr);
    const isTokenOperator = isTokenMathOp || isTokenCondOp;
    const isTokenOpen = valStr === '(';
    const isTokenClose = valStr === ')';
    const isTokenComma = valStr === ',';

    if (isTokenOpen) {
      openParens++;
      const prevValStr = prev ? String(prev.value).toUpperCase() : '';
      functionStack.push(['IF', 'AND', 'OR'].includes(prevValStr) ? prevValStr : 'GROUP');
    }

    if (isTokenClose) {
      openParens--;
      functionStack.pop();
    }

    if (openParens < 0) {
      return { valid: false, message: 'Mismatched parentheses: Too many closing brackets.' };
    }

    if (isTokenComma && openParens === 0) {
      return { valid: false, message: "Commas (,) are only allowed inside function parameters like IF() or AND()." };
    }

    if (['AND', 'OR'].includes(valStr)) {
      if (!functionStack.includes('IF')) {
        return { valid: false, message: `Logical operator '${valStr}' must be inside an IF() statement.` };
      }
    }

    if (isTokenCondOp && !functionStack.includes('IF')) {
      return { valid: false, message: `Conditionals (${valStr}) must be inside an IF() statement.` };
    }

    if (prev) {
      const prevValStr = String(prev.value).toUpperCase();
      const isPrevVal = prev.type === 'ptag' || prev.type === 'vtag' || prev.type === 'number';
      const isPrevMathOp = ['+', '-', '*', '/'].includes(prevValStr);
      const isPrevCondOp = ['>', '<', '=', '>=', '<='].includes(prevValStr);
      const isPrevOperator = isPrevMathOp || isPrevCondOp;
      const isPrevFunc = ['IF', 'AND', 'OR'].includes(prevValStr);
      const isPrevOpen = prevValStr === '(';
      const isPrevClose = prevValStr === ')';
      const isPrevComma = prevValStr === ',';

      // Rule 1: Functions MUST be followed by '('
      if (isPrevFunc && !isTokenOpen) {
        return { valid: false, message: `Syntax error: '${prev.label}' must be followed by '('.` };
      }

      // Rule 2: Consecutive operators
      if (isPrevOperator && isTokenOperator) {
        return { valid: false, message: `Syntax error: Consecutive operators (${prev.label} followed by ${token.label}).` };
      }

      // Rule 3: Missing operator between values
      if (isPrevVal && isTokenVal) {
        return { valid: false, message: `Syntax error: Missing operator between ${prev.label} and ${token.label}.` };
      }

      // Rule 4: Value directly followed by '(' or vice-versa
      if ((isPrevVal || isPrevClose) && isTokenOpen) {
        return { valid: false, message: `Syntax error: Missing operator before '('.` };
      }

      // Rule 5: ')' directly followed by a value without an operator
      if (isPrevClose && isTokenVal) {
        return { valid: false, message: `Syntax error: Missing operator between ')' and ${token.label}.` };
      }
      
      // Rule 6: Invalid sequences like '+ )', ', )', '( +' etc. 
      if ((isPrevOperator || isPrevComma || isPrevOpen) && (isTokenClose || isTokenComma)) {
          return { valid: false, message: `Syntax error: Invalid sequence '${prev.label}' followed by '${token.label}'.` };
      }

      // Rule 7: Open paren or comma followed by mathematical or conditional operator
      if ((isPrevOpen || isPrevComma) && isTokenOperator) {
          // Allow negative unary like IF ( - 5 )
          if (valStr !== '-') {
             return { valid: false, message: `Syntax error: '${prev.label}' followed by operator '${token.label}'.` };
          }
      }
    }
  }

  if (openParens > 0) {
    return { valid: false, message: 'Mismatched parentheses: Missing closing brackets.' };
  }

  const lastToken = tokens[tokens.length - 1];
  const lastValStr = String(lastToken.value).toUpperCase();
  const isLastInvalidStr = ['+', '-', '*', '/', '>', '<', '=', '>=', '<=', 'AND', 'OR', ',', 'IF', '('].includes(lastValStr);
  if (isLastInvalidStr) {
     return { valid: false, message: `Formula cannot end with '${lastToken.label}'.` };
  }

  return { valid: true, message: 'Formula syntax looks valid.' };
};

export const FormulaBuilder = () => {
  const { config, addToken, updateTokenOrder, removeToken } = useVtagStore();
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOverMainZone, setIsOverMainZone] = useState(false);
  const [customNum, setCustomNum] = useState<string>('');
  const [ptagSearch, setPtagSearch] = useState<string>('');
  const [keyboardInput, setKeyboardInput] = useState<string>('');
    const [insertionIndex, setInsertionIndex] = useState<number | null>(null);
  const [availableTags, setAvailableTags] = useState<Omit<FormulaToken, 'id'>[]>([]);
  const [isFetchingTags, setIsFetchingTags] = useState(true);

  const [vtagSearch, setVtagSearch] = useState<string>('');
  const [availableVtags, setAvailableVtags] = useState<Omit<FormulaToken, 'id'>[]>([]);
  const [isFetchingVtags, setIsFetchingVtags] = useState(false);

    // Multi-select state for bulk insertion
    const [selectedTags, setSelectedTags] = useState<Omit<FormulaToken, 'id'>[]>([]);

    const handleToggleTag = (tag: Omit<FormulaToken, 'id'>, checked: boolean) => {
      setSelectedTags(prev => 
        checked ? [...prev, tag] : prev.filter(t => t.value !== tag.value)
      );
    };

    const handleQuickAdd = (tag: Omit<FormulaToken, 'id'>) => {
        if (tag.type === 'vtag' && (tag.value === config.name || tag.label === config.name || config.name.includes(tag.label!) )) { message.error('Cannot add a V-Tag to its own formula.'); return; }
      addToken({ ...tag, id: `TOKEN_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` }, insertionIndex !== null ? insertionIndex : undefined); if (insertionIndex !== null) setInsertionIndex(insertionIndex + 1);
    };

    const handleAddSelectedTokens = () => {
      if (selectedTags.length === 0) return;
      const newTokens = selectedTags.map(tag => ({
        ...tag,
        id: `TOKEN_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
      }));
      if (useVtagStore.getState().addTokens) {
        useVtagStore.getState().addTokens(newTokens);
      } else {
        // Fallback if addTokens is somehow not available
        newTokens.forEach(t => addToken(t));
      }
      setSelectedTags([]); // Clear selection after adding
    };
    useEffect(() => {
    const fetchVtags = async () => {
      try {
        setIsFetchingVtags(true);
        const response = await fetch('/api/vtags');
        const result = await response.json();
        if (result.success && result.data) {
          const fetchedVtags: Omit<FormulaToken, 'id'>[] = result.data.map((tag: any) => ({
            type: 'vtag',
            value: tag.systemCode || tag.Code,
            label: tag.name || tag.systemCode || tag.Code,
            level: tag.calculationLevel || 1
          }));
          setAvailableVtags(fetchedVtags);
        }
      } catch (error) {
        console.error('Error fetching V-TAGs:', error);
      } finally {
        setIsFetchingVtags(false);
      }
    };
    fetchVtags();
  }, []);

  const filteredVtags = availableVtags.filter(tag => 
    (tag.label?.toLowerCase() || '').includes(vtagSearch.toLowerCase()) || 
    tag.value.toLowerCase().includes(vtagSearch.toLowerCase())
  );

  // Fetch real P-Tags from backend DW_D_EAPtag table
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsFetchingTags(true);
        // By default limit to 100 tags for performance unless searched, 
        // passing q=ptagSearch allows dynamic searching in the backend
        const response = await fetch(`/api/tags/search?limit=100${ptagSearch ? `&q=${encodeURIComponent(ptagSearch)}` : ''}`);
        const result = await response.json();
        
        if (result.success && result.data && result.data.tags) {
            const fetchedTags: Omit<FormulaToken, 'id'>[] = result.data.tags.map((tag: any) => ({
                type: 'ptag',
                value: tag.Code,
                label: tag.Name || tag.Code,
                level: 0
            }));
            
            // Optionally add the mock V-Tag for testing nested logic, or keep purely P-Tags
            fetchedTags.push({ type: 'vtag', value: 'VTAG_BLD_A', label: 'Building A Total (Virtual)', level: 1 });
            
            setAvailableTags(fetchedTags);
        } else {
            console.error('Failed to parse tags:', result);
            setAvailableTags(MOCK_PTAGS); // Fallback
        }
      } catch (error) {
        console.error('Error fetching P-TAGs:', error);
        setAvailableTags(MOCK_PTAGS); // Fallback
      } finally {
        setIsFetchingTags(false);
      }
    };
    
    // Add small debounce to prevent spamming the SQL DB while typing
    const timeoutId = setTimeout(() => {
        fetchTags();
    }, 400);
    
    return () => clearTimeout(timeoutId);
  }, [ptagSearch]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && keyboardInput === '' && config.formulaTokens.length > 0) {
      removeToken(config.formulaTokens[config.formulaTokens.length - 1].id);
      return;
    }
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const val = keyboardInput.trim().toUpperCase();
      if (!val) return;

      // Check operators and conditionals
      const op = OPERATORS_AND_CONDITIONS.find(o => o.value.toUpperCase() === val || (o.label && o.label.toUpperCase() === val));
      if (op) {
        addToken({ ...op, id: `TOKEN_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` }, insertionIndex !== null ? insertionIndex : undefined); if (insertionIndex !== null) setInsertionIndex(insertionIndex + 1);
        setKeyboardInput('');
        return;
      }

      // Check numbers
      if (!isNaN(Number(val))) {
        addToken({ type: 'number', value: val, label: val, level: 0, id: `TOKEN_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` });
        setKeyboardInput('');
        return;
      }

      // Check known PTAGs/VTAGs by name/id
      const allKnownTags = [...availableTags, ...availableVtags];
      const tag = allKnownTags.find(t => t.value.toUpperCase() === val || (t.label && t.label.toUpperCase() === val));
      if (tag) {
         addToken({ ...tag, id: `TOKEN_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` }, insertionIndex !== null ? insertionIndex : undefined); if (insertionIndex !== null) setInsertionIndex(insertionIndex + 1);
         setKeyboardInput('');
         return;
      }
    }
  };

  useEffect(() => {
    invariant(dropZoneRef.current);
    
    // Main drop zone
    const targetCleanup = dropTargetForElements({
      element: dropZoneRef.current,
      getData: () => ({ isMainDropZone: true }),
      onDragEnter: () => setIsOverMainZone(true),
      onDragLeave: () => setIsOverMainZone(false),
      onDrop: () => setIsOverMainZone(false),
    });

    // Subscribing to all drops to orchestrate state updates
    const monitorCleanup = monitorForElements({
      onDrop: (args) => {
        const { source, location } = args;
        const targetClass = location.current.dropTargets[0];
        if (!targetClass) return;

        const sourceData: any = source.data;
        const targetData: any = targetClass.data;

        // Where is it dropping?
        let dropIndex = config.formulaTokens.length; // default to end
        if (targetData.isFormulaItemArea) {
          dropIndex = targetData.index;
        }

        // What was dropped?
        if (sourceData.isPaletteItem) {
          if (Array.isArray(sourceData.tokenData)) {
            const newTokens = sourceData.tokenData.map((t: any) => ({
              ...t,
              id: `TOKEN_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
            }));
            if (useVtagStore.getState().addTokens) {
              useVtagStore.getState().addTokens(newTokens, dropIndex);
            } else {
              newTokens.forEach((t: any, i: number) => addToken(t, dropIndex + i));
            }
            setSelectedTags([]); // Clear selection after drop
          } else {
            // Add new token
            const newToken: FormulaToken = {
              ...sourceData.tokenData,
              id: `TOKEN_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
            };
            addToken(newToken, dropIndex);
          }
        } else if (sourceData.isExistingItem) {
          // Reorder token
          const fromIndex = sourceData.index;
          if (fromIndex !== dropIndex) {
            // Adjust drop index if it's moving forward
            const finalDrop = dropIndex > fromIndex ? dropIndex - 1 : dropIndex;
            updateTokenOrder(fromIndex, finalDrop);
          }
        }
      }
    });

    return () => {
      targetCleanup();
      monitorCleanup();
    };
  }, [config.formulaTokens, addToken, updateTokenOrder]);

  const handleAddNumber = () => {
    if (customNum && !isNaN(Number(customNum))) {
      addToken({
        id: `TOKEN_${Date.now()}`,
        type: 'number',
        value: customNum,
        label: customNum,
        level: 0
      });
      setCustomNum('');
    }
  };

  const formulaStatus = checkFormulaValidity(config.formulaTokens);

  // Helper to neatly format the preview text 
  const getPreviewText = (t: FormulaToken) => {
    let text = t.label || t.value;
    if ((t.type === 'ptag' || t.type === 'vtag') && text && text.includes('\\')) {
      const parts = text.split('\\');
      if (parts.length >= 2) return parts.slice(-2).join('\\');
    }
    return text;
  };

  return (
    <Flex vertical gap={16} style={{ height: '100%' }}>
      {/* Equation Viewer Panel */}
      <Card 
        variant="outlined"
        style={{ 
          backgroundColor: formulaStatus.valid ? '#f8f9fa' : '#fff4f4', 
          borderColor: formulaStatus.valid ? '#91caff' : '#ffa39e',
          borderRadius: 8,
          position: 'relative'
        }}
        styles={{ body: { padding: '16px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong style={{ color: formulaStatus.valid ? '#1677ff' : '#ff4d4f', textTransform: 'uppercase' }}>
            Current Equation Preview
          </Text>
          {!formulaStatus.valid && config.formulaTokens.length > 0 && (
            <Text strong style={{ color: '#ff4d4f', display: 'flex', alignItems: 'center', gap: 4, fontSize: '12px' }}>
              <WarningOutlined /> {formulaStatus.message}
            </Text>
          )}
        </div>
        <Title 
          level={4} 
          style={{ 
            fontFamily: 'monospace', 
            marginTop: 8, 
            marginBottom: 0,
            wordBreak: 'break-word',
            color: config.formulaTokens.length === 0 ? 'rgba(0, 0, 0, 0.45)' : 'inherit',
            minHeight: '32px'
          }}
        >
          {config.formulaTokens.length === 0 
            ? 'No formula constructed yet...'
            : config.formulaTokens.map(getPreviewText).join(' ')}
        </Title>
      </Card>

      <Row gutter={[16, 16]} style={{ flex: 1, minHeight: 600 }}>
        {/* Searchable PTAG/VTAG kanban-style list */}
        <Col xs={24} md={8} lg={6}>
          <div 
            style={{ 
              height: '100%', 
              minHeight: 500,
              display: 'flex', 
              flexDirection: 'column', 
              backgroundColor: 'white',
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              overflow: 'hidden'
            }}
          >
            <Tabs
              defaultActiveKey="ptag"
              centered
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
              items={[
                {
                  key: 'ptag',
                  label: 'P-Tags',
                  children: (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div style={{ padding: '0 12px 12px 12px' }}>
                        <Input
                          size="middle"
                          placeholder="Search P-Tags..."
                          value={ptagSearch}
                          onChange={(e) => setPtagSearch(e.target.value)}
                          prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                        />
                      </div>
                      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px 12px', minHeight: 400 }}>
                        {selectedTags.length > 0 && (
                          <Button 
                            type="primary" 
                            size="small" 
                            style={{ marginBottom: 12, width: '100%' }}
                            onClick={handleAddSelectedTokens}
                          >
                            Insert {selectedTags.length} Selected
                          </Button>
                        )}
                        {isFetchingTags ? (
                          <div style={{ textAlign: 'center' }}><Text type="secondary">Loading tags...</Text></div>
                        ) : availableTags.length === 0 ? (
                          <div style={{ textAlign: 'center' }}><Text type="secondary">No tags found.</Text></div>
                        ) : (
                          availableTags.slice(0, 10).map((token, i) => (
                            <PtagListItem 
                              key={i} 
                              token={token} 
                              isSelected={selectedTags.some(t => t.value === token.value)}
                              onToggle={(checked) => handleToggleTag(token, checked)}
                              onQuickAdd={() => handleQuickAdd(token)}
                              dragPayload={selectedTags.some(t => t.value === token.value) && selectedTags.length > 0 ? selectedTags : [token]}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'vtag',
                  label: 'V-Tags',
                  children: (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div style={{ padding: '0 12px 12px 12px' }}>
                        <Input
                          size="middle"
                          placeholder="Search V-Tags..."
                          value={vtagSearch}
                          onChange={(e) => setVtagSearch(e.target.value)}
                          prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                        />
                      </div>
                      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px 12px', minHeight: 400 }}>
                        {selectedTags.length > 0 && (
                          <Button 
                            type="primary" 
                            size="small" 
                            style={{ marginBottom: 12, width: '100%' }}
                            onClick={handleAddSelectedTokens}
                          >
                            Insert {selectedTags.length} Selected
                          </Button>
                        )}
                        {isFetchingVtags ? (
                          <div style={{ textAlign: 'center' }}><Text type="secondary">Loading V-Tags...</Text></div>
                        ) : filteredVtags.length === 0 ? (
                          <div style={{ textAlign: 'center' }}><Text type="secondary">No V-Tags found.</Text></div>
                        ) : (
                          filteredVtags.slice(0, 50).map((token, i) => (
                            <PtagListItem 
                              key={i} 
                              token={token} 
                              isSelected={selectedTags.some(t => t.value === token.value)}
                              onToggle={(checked) => handleToggleTag(token, checked)}
                              onQuickAdd={() => handleQuickAdd(token)}
                              dragPayload={selectedTags.some(t => t.value === token.value) && selectedTags.length > 0 ? selectedTags : [token]}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  )
                }
              ]}
            />
          </div>
        </Col>

        {/* Main Builder Area */}
        <Col xs={24} md={16} lg={18}>
          <Flex vertical gap="middle" style={{ height: '100%' }}>
            <Card variant="outlined" styles={{ body: { padding: '16px' } }} style={{ backgroundColor: 'white' }}>
               <Text type="secondary" strong style={{ display: 'block', marginBottom: 8 }}>
                 Operators & Conditionals
               </Text>
               <Flex wrap="wrap" gap={8} align="center">
                 {OPERATORS_AND_CONDITIONS.map((token, i) => (
                   <PaletteItem key={i} token={token} />
                 ))}
                 <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                   <Input 
                     size="middle" 
                     placeholder="Const (e.g. 1.5)" 
                     style={{ width: 140 }}
                     value={customNum}
                     onChange={(e) => setCustomNum(e.target.value)}
                     onPressEnter={handleAddNumber}
                   />
                   <Button type="primary" size="middle" onClick={handleAddNumber}>Add</Button>
                 </div>
               </Flex>
            </Card>

            {/* Builder Drop Zone */}
            <div
              ref={dropZoneRef}
              onClick={() => inputRef.current?.focus()}
              style={{
                minHeight: 350,
                backgroundColor: isOverMainZone ? '#fafafa' : 'white',
                border: '2px dashed',
                borderColor: isOverMainZone ? '#1677ff' : '#d9d9d9',
                borderRadius: 8,
                padding: '16px',
                paddingBottom: '24px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                alignContent: 'flex-start',
                transition: 'all 0.2s ease',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.02)',
                cursor: 'text'
              }}
            >
              {config.formulaTokens.map((token, index) => (
                  <React.Fragment key={token.id}>
                    <div 
                      onClick={(e) => { e.stopPropagation(); setInsertionIndex(index); }}
                      style={{ width: '8px', height: '34px', cursor: 'text', zIndex: 10, flexShrink: 0, backgroundColor: insertionIndex === index ? '#1677ff' : 'transparent', opacity: 0.2 }}
                      title="Click to insert"
                    />
                    {insertionIndex === index && (
                      <input
                        autoFocus
                        value={keyboardInput}
                        onChange={(e) => setKeyboardInput(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        placeholder="Type..."
                        style={{ width: Math.max(60, keyboardInput.length * 10) + 'px', border: 'none', outline: 'none', background: 'transparent', fontSize: '16px', color: '#1677ff', borderBottom: '1px solid #1677ff', padding: '0 4px', textAlign: 'center' }}
                      />
                    )}
                    <FormulaItem token={token} index={index} />
                  </React.Fragment>
                ))}
            
                <div 
                  onClick={(e) => { e.stopPropagation(); setInsertionIndex(null); inputRef.current?.focus(); }}
                  style={{ width: '8px', height: '34px', cursor: 'text', flexShrink: 0 }}
                />
                <input
                  ref={inputRef}
                  value={keyboardInput}
                  onChange={(e) => setKeyboardInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={config.formulaTokens.length === 0 ? "Drag tags here or type formula (press Space or Enter to add)..." : "Type..."}
                  style={{
                    display: insertionIndex === null ? 'block' : 'none',
                    flex: 1,
                    minWidth: '250px',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '16px',
                    padding: '8px',
                    fontFamily: 'inherit',
                    color: '#333'
                  }}
                />
            </div>
          </Flex>
        </Col>
      </Row>
    </Flex>
  );
};

export default FormulaBuilder;

