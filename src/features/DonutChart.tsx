import * as d3 from 'd3';
import { FC, useEffect, useRef } from 'react';

import Spinner from 'components/Spinner';
import { useResizeObserver } from 'hooks/useResizeObserver';

const DonutChart: FC<IChart> = ({ data, svgWrapperRef }) => {
  const dimensions: any = useResizeObserver(svgWrapperRef);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef?.current || !dimensions) return;

    const innerWidth = dimensions?.width;
    const innerHeight = dimensions?.height;
    const radius = Math.min(innerWidth, innerHeight) / 2;

    const svg = d3.select(svgRef?.current);
    svg.selectAll('*').remove();

    const pieGenerator = d3
      .pie<IData>()
      .value(({ value }) => value)
      .sort(null);

    const arcGenerator: any = d3
      .arc<d3.PieArcDatum<IData>>()
      .innerRadius(radius * 0.35)
      .outerRadius(radius * 0.65);

    const arcGeneratorForLabel = d3
      .arc<d3.PieArcDatum<IData>>()
      .innerRadius(radius)
      .outerRadius(radius * 0.85);

    const slices = pieGenerator([...data]);

    const g = svg
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .append('g')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight / 2})`);

    g.selectAll('path')
      .data(slices)
      .enter()
      .append('path')
      .attr('fill', (d, i) => d?.data?.fillColor)
      .attr('d', arcGenerator);

    g.selectAll('polyline')
      .data(slices)
      .enter()
      .append('polyline')
      .style('fill', 'none')
      .style('stroke', 'steelblue')
      .attr('points', (d) => {
        const pos = arcGeneratorForLabel.centroid(d);
        pos[0] = radius * 0.65 * (midAngle(d) < Math.PI ? 1 : -1);
        return [arcGenerator.centroid(d), arcGeneratorForLabel.centroid(d), pos];
      });

    g.selectAll('text')
      .data(slices)
      .enter()
      .append('text')
      .transition()
      .duration(500)
      .attr('dy', '.35em')
      .text((d) => d?.data?.label)
      .attr('transform', (d) => {
        const pos = arcGeneratorForLabel.centroid(d);
        pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .style('font-size', '12px')
      .style('fill', (d) => d?.data?.fillColor);
  }, [data, dimensions]);

  const midAngle = (d: any) => d.startAngle + (d.endAngle - d.startAngle) / 2;

  if (!dimensions) {
    return (
      <div className="flex w-full justify-center items-center py-2">
        <Spinner className="text-gray-300 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="d3js">
      <svg ref={svgRef} />
    </div>
  );
};

interface IData {
  label: string;
  value: number;
  fillColor: string;
}

interface IChart {
  data: IData[];
  svgWrapperRef: any;
}

export default DonutChart;
