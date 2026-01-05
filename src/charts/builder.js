/**
 * Chart Builder
 * Creates various chart types using PptxGenJS
 */

/**
 * Build a chart on a slide
 */
export async function buildChart(slide, pptx, chartConfig, chartColors) {
  const {
    type = 'bar',
    labels = [],
    datasets = [],
    data = [],
    values = [],
    chartTitle,
    showLegend = true
  } = chartConfig;
  
  // Handle simplified format (just values array)
  let chartData;
  if (datasets && datasets.length > 0) {
    chartData = datasets.map(ds => ({
      name: ds.name || ds.label || 'Data',
      labels: labels,
      values: ds.values || ds.data || []
    }));
  } else if (values && values.length > 0) {
    chartData = [{
      name: 'Data',
      labels: labels,
      values: values
    }];
  } else if (data && data.length > 0) {
    chartData = [{
      name: 'Data',
      labels: labels,
      values: data
    }];
  } else {
    console.warn('[Chart] No data provided');
    return;
  }
  
  // Map chart type to PptxGenJS type
  const chartTypeMap = {
    'bar': pptx.charts.BAR,
    'column': pptx.charts.COLUMN,
    'line': pptx.charts.LINE,
    'pie': pptx.charts.PIE,
    'doughnut': pptx.charts.DOUGHNUT,
    'area': pptx.charts.AREA
  };
  
  const pptxChartType = chartTypeMap[type.toLowerCase()] || pptx.charts.BAR;
  
  // Chart options
  const options = {
    x: 0.5,
    y: 1.3,
    w: 9,
    h: 3.5,
    chartColors: chartColors || ['4472C4', 'ED7D31', 'A5A5A5', 'FFC000', '5B9BD5'],
    showLegend: showLegend && chartData.length > 1,
    legendPos: 'b',
    showTitle: !!chartTitle,
    title: chartTitle || '',
    showCatAxisTitle: false,
    showValAxisTitle: false,
    catAxisLabelFontSize: 10,
    valAxisLabelFontSize: 10
  };
  
  // Type-specific options
  if (type === 'pie' || type === 'doughnut') {
    options.showPercent = true;
    options.showValue = false;
    options.showLegend = true;
    options.legendPos = 'r';
  }
  
  if (type === 'line') {
    options.lineSmooth = true;
    options.lineSize = 2;
    options.lineDataSymbol = 'circle';
    options.lineDataSymbolSize = 8;
  }
  
  if (type === 'bar' || type === 'column') {
    options.barGapWidthPct = 50;
  }
  
  // Add chart to slide
  try {
    slide.addChart(pptxChartType, chartData, options);
  } catch (err) {
    console.error('[Chart] Failed to create chart:', err.message);
  }
}

/**
 * Validate chart data
 */
export function validateChartData(chartConfig) {
  const errors = [];
  
  if (!chartConfig) {
    errors.push('Chart configuration is required');
    return { valid: false, errors };
  }
  
  const { labels, datasets, values, data } = chartConfig;
  
  // Must have labels
  if (!labels || labels.length === 0) {
    errors.push('Chart must have labels');
  }
  
  // Must have data in some form
  const hasData = (datasets && datasets.length > 0) || 
                  (values && values.length > 0) ||
                  (data && data.length > 0);
  
  if (!hasData) {
    errors.push('Chart must have data (datasets, values, or data)');
  }
  
  // Validate data lengths match labels
  if (labels && values && values.length !== labels.length) {
    errors.push(`Values length (${values.length}) must match labels length (${labels.length})`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
