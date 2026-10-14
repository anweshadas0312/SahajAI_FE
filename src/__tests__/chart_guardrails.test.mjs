import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Mirror of frontend chart validation logic in ChartRenderer.tsx
 */
function validateChartPayload(dataPayload) {
  const initialType = (dataPayload?.type || 'pie').toLowerCase();
  const rawData = Array.isArray(dataPayload?.data) ? dataPayload.data : [];

  if (rawData.length === 0) {
    return { valid: false, error: 'No data points provided for chart visualization.' };
  }

  const validDataItems = [];
  for (let i = 0; i < rawData.length; i++) {
    const item = rawData[i];
    if (!item || typeof item !== 'object') {
      return { valid: false, error: `Invalid data point at index ${i + 1}.` };
    }
    const rawName = item.name ?? item.label ?? item.category;
    if (rawName === undefined || rawName === null || String(rawName).trim() === '') {
      return { valid: false, error: `Missing category name at index ${i + 1}.` };
    }
    const val = item.value;
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
      return { valid: false, error: `Invalid non-numeric value for '${String(rawName)}': ${val}.` };
    }
    validDataItems.push({ ...item, name: String(rawName), value: val });
  }

  if (initialType === 'pie') {
    if (validDataItems.length < 2) {
      return { valid: false, error: 'Pie charts require at least two categories to establish proportional parts of a whole.' };
    }
    if (validDataItems.some(it => it.value < 0)) {
      return { valid: false, error: 'Pie charts cannot display negative values.' };
    }
    const sum = validDataItems.reduce((acc, it) => acc + it.value, 0);
    if (sum <= 0) {
      return { valid: false, error: 'Total value must be greater than zero to establish meaningful proportions.' };
    }
  } else if (initialType === 'line') {
    if (validDataItems.length < 2) {
      return { valid: false, error: 'Line charts require at least two data points to establish a continuous trend.' };
    }
  }

  return { valid: true, data: validDataItems, type: initialType };
}

/**
 * Mirror of frontend MessageList code block parser logic
 */
function parseMessageCodeBlock(lang, rawContent, isGenerating, isLastMessage) {
  const normalizedLang = (lang || '').toLowerCase();

  // Strict language enforcement: ONLY explicit chart block tags
  if (normalizedLang === 'chart' || normalizedLang === 'pie' || normalizedLang === 'bar' || normalizedLang === 'line') {
    try {
      let jsonToParse = rawContent;
      const startBrace = jsonToParse.indexOf('{');
      const endBrace = jsonToParse.lastIndexOf('}');
      if (startBrace !== -1 && endBrace > startBrace) {
        jsonToParse = jsonToParse.substring(startBrace, endBrace + 1);
      }
      jsonToParse = jsonToParse.replace(/new\s+Date\(\s*(\d{4})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*\)/g, (_, y, m, d) => {
        const month = String(Number(m) + 1).padStart(2, '0');
        const day = String(d).padStart(2, '0');
        return `"${y}-${month}-${day}"`;
      });
      jsonToParse = jsonToParse.replace(/new\s+Date\(\s*['"]([^'"]+)['"]\s*\)/g, '"$1"');
      jsonToParse = jsonToParse.replace(/,\s*([}\]])/g, '$1');

      const parsed = JSON.parse(jsonToParse);
      if (parsed && typeof parsed === 'object') {
        if (!parsed.type && (normalizedLang === 'pie' || normalizedLang === 'bar' || normalizedLang === 'line')) {
          parsed.type = normalizedLang;
        }
        const validation = validateChartPayload(parsed);
        if (validation.valid) {
          return { type: 'chart', payload: parsed };
        }
        return { type: 'limitation_notice', error: validation.error };
      }
    } catch (e) {
      if (isGenerating && isLastMessage) {
        return { type: 'streaming_indicator', message: 'Generating chart visualization...' };
      }
      return { type: 'limitation_notice', error: 'Unable to parse chart specification payload.' };
    }
  }

  // Generic code block fallback (json, typescript, python, unlabelled, etc.)
  return { type: 'code_block', lang: normalizedLang, content: rawContent };
}

describe('Frontend Chart Guardrails & Fallback Tests', () => {

  test('Valid Pie Chart renders with valid positive categories', () => {
    const payload = {
      type: 'pie',
      title: 'Portfolio Allocation',
      data: [
        { name: 'Equities', value: 60 },
        { name: 'Bonds', value: 30 },
        { name: 'Cash', value: 10 }
      ]
    };
    const res = validateChartPayload(payload);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.data.length, 3);
  });

  test('Pie Chart rejects negative numbers without coercion to zero', () => {
    const payload = {
      type: 'pie',
      title: 'Invalid Pie',
      data: [
        { name: 'A', value: 50 },
        { name: 'B', value: -10 }
      ]
    };
    const res = validateChartPayload(payload);
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /cannot display negative values/i);
  });

  test('Pie Chart rejects total sum equal to zero', () => {
    const payload = {
      type: 'pie',
      title: 'Zero Pie',
      data: [
        { name: 'A', value: 0 },
        { name: 'B', value: 0 }
      ]
    };
    const res = validateChartPayload(payload);
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /Total value must be greater than zero/i);
  });

  test('Pie Chart rejects single category', () => {
    const payload = {
      type: 'pie',
      title: 'Single Category',
      data: [{ name: 'Solo', value: 100 }]
    };
    const res = validateChartPayload(payload);
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /require at least two categories/i);
  });

  test('Valid Bar Chart permits legitimate negative values', () => {
    const payload = {
      type: 'bar',
      title: 'Quarterly Net Profit',
      data: [
        { name: 'Q1', value: 1200 },
        { name: 'Q2', value: -300 },
        { name: 'Q3', value: 850 }
      ]
    };
    const res = validateChartPayload(payload);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.data[1].value, -300);
  });

  test('Bar Chart rejects non-numeric or string values without silent zero coercion', () => {
    const payload = {
      type: 'bar',
      title: 'Invalid Bar',
      data: [
        { name: 'A', value: 100 },
        { name: 'B', value: 'invalid_number' }
      ]
    };
    const res = validateChartPayload(payload);
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /Invalid non-numeric value/i);
  });

  test('Valid Line Chart requires at least two points', () => {
    const validPayload = {
      type: 'line',
      title: 'Monthly Trend',
      data: [
        { name: 'Jan', value: 10 },
        { name: 'Feb', value: 25 }
      ]
    };
    assert.strictEqual(validateChartPayload(validPayload).valid, true);

    const singlePointPayload = {
      type: 'line',
      title: 'Single Point',
      data: [{ name: 'Jan', value: 10 }]
    };
    const res = validateChartPayload(singlePointPayload);
    assert.strictEqual(res.valid, false);
    assert.match(res.error, /require at least two data points/i);
  });

  test('Markdown tables and ordinary prose never synthesize charts', () => {
    // Ordinary table text
    const tableText = `| Item | Value |\n| Gold | 22956 |\n| Silver | 12000 |`;
    // Prose with colon numeric list
    const proseText = `Here is your summary:\n- Gold: 22,956\n- Silver: 12,000\nTotal sales are strong.`;

    // In MessageList, these are rendered as standard markdown, not passed as chart blocks
    // Verifying that without an explicit chart codeblock, no chart parsing is invoked
    const parsedBlock1 = parseMessageCodeBlock('', tableText, false, false);
    assert.strictEqual(parsedBlock1.type, 'code_block');

    const parsedBlock2 = parseMessageCodeBlock('text', proseText, false, false);
    assert.strictEqual(parsedBlock2.type, 'code_block');
  });

  test('Fenced json codeblocks are rendered as code, not charts', () => {
    const jsonContent = JSON.stringify({
      type: 'bar',
      title: 'Server Metrics',
      data: [{ name: 'CPU', value: 45 }]
    }, null, 2);

    const parsed = parseMessageCodeBlock('json', jsonContent, false, false);
    assert.strictEqual(parsed.type, 'code_block');
    assert.strictEqual(parsed.lang, 'json');
  });

  test('Streamed partial chart block displays generating indicator during streaming', () => {
    const partialJson = '{"type": "bar", "title": "Incompl';
    const parsed = parseMessageCodeBlock('chart', partialJson, true, true);
    assert.strictEqual(parsed.type, 'streaming_indicator');
    assert.match(parsed.message, /Generating chart visualization/i);
  });

  test('Completed malformed chart block displays limitation notice without crashing', () => {
    const malformedJson = '{"type": "bar", "title": "Broken Json...';
    const parsed = parseMessageCodeBlock('chart', malformedJson, false, false);
    assert.strictEqual(parsed.type, 'limitation_notice');
    assert.match(parsed.error, /Unable to parse chart specification/i);
  });

  test('Completed chart block with invalid schema displays specific limitation notice', () => {
    const invalidJson = JSON.stringify({
      type: 'pie',
      title: 'Broken Pie',
      data: [{ name: 'A', value: -50 }, { name: 'B', value: 10 }]
    });
    const parsed = parseMessageCodeBlock('chart', invalidJson, false, false);
    assert.strictEqual(parsed.type, 'limitation_notice');
    assert.match(parsed.error, /cannot display negative values/i);
  });

  test('Line chart block with JS new Date(...) syntax normalizes to ISO dates and renders cleanly', () => {
    const jsDateBlock = `{
  "type": "line",
  "title": "Total Quantity Ordered by Order Date",
  "data": [
    {"name": new Date(2017, 0, 1), "value": 7},
    {"name": new Date(2017, 0, 2), "value": 121},
    {"name": new Date(2017, 0, 3), "value": 25}
  ]
}`;
    const parsed = parseMessageCodeBlock('chart', jsDateBlock, false, false);
    assert.strictEqual(parsed.type, 'chart');
    assert.strictEqual(parsed.payload.data.length, 3);
    assert.strictEqual(parsed.payload.data[0].name, '2017-01-01');
    assert.strictEqual(parsed.payload.data[0].value, 7);
    assert.strictEqual(parsed.payload.data[1].value, 121);
    assert.strictEqual(parsed.payload.data[2].value, 25);
  });

  test('Exact order.csv Line Chart payload parses and validates successfully with 3 points', () => {
    const payloadStr = `{
  "type": "line",
  "title": "Total Quantity Ordered by Order Date",
  "data": [
    {
      "name": "01-Jan-17",
      "value": 7
    },
    {
      "name": "02-Jan-17",
      "value": 121
    },
    {
      "name": "03-Jan-17",
      "value": 25
    }
  ]
}`;
    const parsed = parseMessageCodeBlock('chart', payloadStr, false, false);
    assert.strictEqual(parsed.type, 'chart');
    assert.strictEqual(parsed.payload.data.length, 3);
    assert.strictEqual(parsed.payload.data[0].name, '01-Jan-17');
    assert.strictEqual(parsed.payload.data[0].value, 7);
    assert.strictEqual(parsed.payload.data[1].name, '02-Jan-17');
    assert.strictEqual(parsed.payload.data[1].value, 121);
    assert.strictEqual(parsed.payload.data[2].name, '03-Jan-17');
    assert.strictEqual(parsed.payload.data[2].value, 25);
  });
});
