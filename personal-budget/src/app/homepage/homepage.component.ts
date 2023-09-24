import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import * as d3 from 'd3';
import { DataService } from '../data.service';

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {

  private data = {
    datasets: [
        {
            data: [] as any[],
            backgroundColor: [
                '#ffcd56',
                '#ff6384',
                '#36a2eb',
                '#fd6b19',
            ]
        }
    ],
    labels: [] as any[]
};

private budgetData: any[] = [];

  constructor(public http: HttpClient, public dataService: DataService) { }

   ngOnInit(): void {
    this.fetchDataAndCreateCharts();
  }

  fetchDataAndCreateCharts() {
    // Fetch data from the backend service if the DataService is empty
    if (this.dataService.getData().length === 0) {
      this.dataService.fetchData().subscribe(
        (res: any) => {
          this.dataService.setData(res.myBudget);

          // Use slice to limit the number of items displayed (e.g., top 5)
          const slicedData = this.dataService.getData().slice(0, 5);

          for (let i = 0; i < slicedData.length; i++) {
            this.data.datasets[0].data[i] = slicedData[i].budget;
            this.data.labels[i] = slicedData[i].title;
            this.budgetData.push(slicedData[i]);
          }

          this.createChart();
          this.createD3Chart();
        }
      );
    } else {
      // Use slice to limit the number of items displayed (e.g., top 5)
      const slicedData = this.dataService.getData().slice(0, 5);

      for (let i = 0; i < slicedData.length; i++) {
        this.data.datasets[0].data[i] = slicedData[i].budget;
        this.data.labels[i] = slicedData[i].title;
        this.budgetData.push(slicedData[i]);
      }

      this.createChart();
      this.createD3Chart();
    }
  }

  private myPieChart: any;

  private createChart() {
    if (this.myPieChart) {
     this.myPieChart.destroy();
    }

    const chartCanvas = document.getElementById('myChart') as HTMLCanvasElement | null;

    if (chartCanvas) {
      const ctx = chartCanvas.getContext('2d');

      if (ctx) {
        this.myPieChart = new Chart(ctx, {
          type: 'pie',
          data: this.data
        });
      }
    }
  }

  private svg: any;
  private margin = 60;
  private width = 400;
  private height = 400;
  private outerRadius = Math.min(this.width, this.height) / 2 - this.margin;
  private innerRadius = this.outerRadius * 0.6;
  private labelOffset = 40;
  private colors: any;

  private createD3Chart(): void {
    this.svg = d3.select("#myD3Chart")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .append("g")
      .attr(
        "transform",
        "translate(" + this.width / 2 + "," + this.height / 2 + ")"
      );

    this.createColors();
    this.drawD3Chart();
  }

  private createColors(): void {
    this.colors = d3.scaleOrdinal()
      .domain(this.budgetData.map((d: any) => d.budget.toString()))
      .range(["#ffcd56", "#ff6384", "#36a2eb", "#fd6b19"]);
  }

  private drawD3Chart(): void {
    const pie = d3.pie<any>().value((d: any) => Number(d.budget));

    const arcGenerator = d3.arc()
      .innerRadius(this.innerRadius)
      .outerRadius(this.outerRadius);

    const midRadius = (this.innerRadius + this.outerRadius) / 2;

    const labelLocation = d3.arc()
      .innerRadius(midRadius)
      .outerRadius(this.outerRadius + this.labelOffset);

    const arcs = this.svg
      .selectAll('pieces')
      .data(pie(this.budgetData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arcGenerator)
      .attr('fill', (d: any, i: any) => this.colors(i))
      .attr("stroke", "#121926")
      .style("stroke-width", "1px")
      .transition()
      .duration(1000)
      .attrTween('d', function (d: any) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t: any) {
          return arcGenerator(interpolate(t));
        };
      });

    arcs.append('text')
      .text((d: any) => `${d.data.title} (${d.data.budget})`)
      .attr("transform", (d: any) => {
        const pos = labelLocation.centroid(d);
        return "translate(" + pos[0] + "," + pos[1] + ")";
      })
      .style("text-anchor", "middle")
      .style("font-size", 15)
      .style("opacity", 0)
      .transition()
      .delay(1000)
      .duration(500)
      .style("opacity", 1);

    arcs.append('line')
      .attr("x1", (d: any) => {
        const pos = arcGenerator.centroid(d);
        const midAngle = Math.atan2(pos[1], pos[0]);
        return Math.cos(midAngle) * midRadius;
      })
      .attr("y1", (d: any) => {
        const pos = arcGenerator.centroid(d);
        const midAngle = Math.atan2(pos[1], pos[0]);
        return Math.sin(midAngle) * midRadius;
      })
      .attr("x2", (d: any) => {
        const pos = labelLocation.centroid(d);
        const midAngle = Math.atan2(pos[1], pos[0]);
        return Math.cos(midAngle) * (midRadius + this.labelOffset);
      })
      .attr("y2", (d: any) => {
        const pos = labelLocation.centroid(d);
        const midAngle = Math.atan2(pos[1], pos[0]);
        return Math.sin(midAngle) * (midRadius + this.labelOffset);
      })
      .attr("stroke", "#121926")
      .style("stroke-width", "2px")
      .style("opacity", 0)
      .transition()
      .delay(1000)
      .duration(500)
      .style("opacity", 1);
  }

}
