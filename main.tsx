import { useEffect, useRef } from 'react';
import {
  createChart,
  createSeriesMarkers,
  CandlestickSeries,
  LineSeries,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  type Time,
} from 'lightweight-charts';
import type { Candle } from '../types';

export interface MarkerLine {
  price: number;
  color: string;
  title?: string;
}

interface CandleChartProps {
  candles: Candle[];
  height?: number;
  /** タップ時の座標(価格)を受け取るコールバック。指定すると操作可能になる */
  onPriceClick?: (price: number, time: number) => void;
  /** 描画する水平線 */
  horizontalLines?: MarkerLine[];
  /** エントリーポイントなどのマーカー */
  markerTime?: number;
  markerColor?: string;
}

export default function CandleChart({
  candles,
  height = 280,
  onPriceClick,
  horizontalLines = [],
  markerTime,
  markerColor = '#22d3ee',
}: CandleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Line'>[]>([]);
  const markersPluginRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);

  // 初期化
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: '#0b0f14' },
        textColor: '#9ca3af',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      timeScale: {
        timeVisible: false,
        secondsVisible: false,
        borderColor: '#1f2937',
      },
      rightPriceScale: {
        borderColor: '#1f2937',
      },
      crosshair: {
        mode: 0,
      },
      handleScroll: !onPriceClick,
      handleScale: !onPriceClick,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    if (onPriceClick) {
      chart.subscribeClick((param) => {
        if (!param.point || param.time === undefined) return;
        const price = series.coordinateToPrice(param.point.y);
        if (price !== null) {
          onPriceClick(price, Number(param.time));
        }
      });
    }

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      lineSeriesRef.current = [];
      markersPluginRef.current = null;
    };
     
  }, [height, onPriceClick]);

  // データ更新
  useEffect(() => {
    if (!seriesRef.current) return;
    const data = candles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    seriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  // 水平線（サポート/レジスタンス等）の描画
  useEffect(() => {
    if (!chartRef.current) return;

    // 既存ラインを削除
    lineSeriesRef.current.forEach((s) => chartRef.current?.removeSeries(s));
    lineSeriesRef.current = [];

    if (candles.length === 0) return;

    horizontalLines.forEach((line) => {
      const lineSeries = chartRef.current!.addSeries(LineSeries, {
        color: line.color,
        lineWidth: 2,
        lineStyle: 2, // dashed
        title: line.title,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      lineSeries.setData([
        { time: candles[0].time as Time, value: line.price },
        { time: candles[candles.length - 1].time as Time, value: line.price },
      ]);
      lineSeriesRef.current.push(lineSeries);
    });
  }, [horizontalLines, candles]);

  // エントリーマーカー
  useEffect(() => {
    if (!seriesRef.current) return;
    if (!markersPluginRef.current) {
      markersPluginRef.current = createSeriesMarkers(seriesRef.current, []);
    }
    if (markerTime === undefined) {
      markersPluginRef.current.setMarkers([]);
      return;
    }
    markersPluginRef.current.setMarkers([
      {
        time: markerTime as Time,
        position: 'belowBar',
        color: markerColor,
        shape: 'arrowUp',
        text: 'ENTRY',
      },
    ]);
  }, [markerTime, markerColor]);

  return <div ref={containerRef} className="w-full touch-none" />;
}
