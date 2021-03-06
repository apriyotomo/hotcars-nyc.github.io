var user_margin={top:20,bottom:20,left:20,right:20},
	user_width=1300-user_margin.left-user_margin.right,
	user_height=630-user_margin.top-user_margin.bottom;

var user_lineColor=['#d62728', '#d62728','#d62728','#2ca02c','#2ca02c','#2ca02c','#9467bd','#1f77b4','#1f77b4','#1f77b4','#ff7f0e','#ff7f0e','#ff7f0e','#ff7f0e','#98df8a','#8c6d31','#8c6d31','#c7c7c7','#bcbd22','#bcbd22','#bcbd22'];

var user_lines = ['1','2','3','4','5','6','7','A','C','E','B','D','F','M','G','J','Z','L','N','Q','R'];

var user_font_size=15,
	subWayHeight=user_height*2/3,
	HeatMapHeight=user_height/3,
	gridWidth = Math.floor((user_width)/ 27),
	gridHeight=Math.floor(HeatMapHeight/8),
	cross=100,
	days = ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat", "Sun"];

var user_x,user_y;

var user_heatMap, user_subwayMap;
		
function user_initiate(){
	var user_container = d3.select('body').append('div').attr('id','user');

	var user_svg=d3.select('div#huan')
		  .append('svg')
		  .attr('width',user_width)
		  .attr('height',user_height)
		  .attr('class','users');

	queue().defer(d3.json,'./data/nyc_boroughs.json') 
		.defer(d3.csv,'./data/weekday_line.csv')
		.defer(d3.json,'./data/paths.json')
		.await(user_start(user_svg));
}

function user_start(user_svg)
{	
	console.log('start user_start');
	user_drawSubmap(user_svg);
	
	d3.csv("./data/weekday_line.csv",function(error, frequency)
	{
		if(error) throw error;
		frequency.forEach(function(d){d.percentage=+d.percentage;});
		user_drawHeatMap(frequency,user_svg);
	});

	user_discription(user_svg);
}

function user_discription(user_svg){
	var discription =  ["The MTA has complete data of the hot car problem such as incident time, ",
						"repair time, subway route and car model, but there is no any complete ",
						"guidance yet for users about this problem. So in this page, we are trying",
						"to provide a comprehensive visualization for passengers. We predict which ",
						"line has the most critical hot car issue so that users can avoid it if possible. ", 
						"Following two visualizations, one is a NYC subway map, another is a heatmap",
						"representing relationship between subway lines and weekdays. If user wants",
						"to get data for a particular line, mouse over lines or line labels in the subway",
						"map, associated data in heatmap will be highlighted. At the same time, mouse ",
						"will change from arrow into hand, that helps users to easily follow what's going",
						"on. What is more, if users want to get information about a particular weekday,",
						"heatmap is intuitive. The possibilities of taking a hot car are encoded as color. ",
						"The redder, the higher possibilities of taking a hot car. if color of two rectangles ",
						"are similar, user can check actual possibilities in linearGradient."
						];

	var content=user_svg.append('g')
						.attr('id','discription')
						.attr('transform',"translate("+cross+","+"70)")
						.selectAll('.user_discription')
						.data(discription)
						.enter()
						.append('text')
						.text(function(d){return d;})
						.attr('x',0)
						.attr('y',function(d,i){return i*user_font_size;})
						.attr('class','user_discription')
						.attr('font-size',user_font_size);


}
	
function user_drawHeatMap(frequency,user_svg)
{

	console.log('start user_drawHeatMap');
	console.log(frequency);
	var minFreq=d3.min(frequency, function(d){return d.percentage;}),
		maxFreq=d3.max(frequency, function(d){return d.percentage;});
	var rectColor=d3.scale.linear().range(['#fff9f9','#e50000']).domain([minFreq,maxFreq]);
    
    var Range = function(min, max, bucket)
    {
					  var interval = (max-min) / parseFloat(bucket);
					  var result = [];
					  var start = min;
					  while (start < max) 
					  {
					    result.push(start)
					    start = start + interval;
  						}
  				return result;
	}

	user_x=d3.scale.ordinal().domain(user_lines).range(Range(cross,cross+21*gridWidth,21));
	user_y=d3.scale.ordinal().domain(days).range(Range(gridHeight/2,7*gridHeight+gridHeight/2,7));		
	
	user_heatMap = user_svg.append('g')
					.attr('class','user_heatMap')
					.attr('transform',"translate("+0+","+(subWayHeight+10)+")");
	
	// var title=user_heatMap.append('text')
	// 				.attr('class','user_subTitle')
	// 				.attr('x',user_width/2)
	// 				.attr('y',-7)
	// 				.attr('text-anchor','middle')
	// 				.style('font-size','30px')
	// 				.text('Possibility of taking a hot car');
	
	var dayLabels = user_heatMap.append('g')
							.attr('class','user_dayLabels')
							.selectAll(".user_dayLabel")
					        .data(days)
					        .enter().append("text")
					        .text(function (d) { return d; })
					        .attr("x", cross-5)
					        .attr("y", function (d, i) { return i * gridHeight+user_font_size*2; })
					        .style('font-size',user_font_size)
					        .attr("class", "user_dayLabel")
					        .attr('text-anchor','end');
   
	var CircleLabel=user_heatMap.append('g')
							.attr('class','user_circleLabels')
							.selectAll('.user_circleLabel')
							.data(user_lineColor)
							.enter()
							.append('circle')
							.attr('cx',function(d,i) { return i * gridWidth+cross+gridWidth/2;})
							.attr('cy',-4)
							.attr('r',user_font_size)
							.style('fill',function(d){return d;})
							.attr("opacity", 0.5)
							.attr('tranform',"translate(" + gridWidth/2 + ", 0)")
							.attr('class','user_circleLabel');
	
	var lineLabels = user_heatMap.append('g')
							.attr('class','user_lineLabels')
							.selectAll(".user_lineLabel")
				            .data(user_lines)
				            .enter().append("text")
				            .text(function(d) { return d; })
				            .attr("x", function(d, i) { return i * gridWidth+cross+gridWidth/2+2; })
				            .attr("y", 0)
				            .style('font-size',user_font_size)
				            .attr("class", 'luser_ineLabel')
				            .attr('id',function(d){return d;})
				            .attr('text-anchor','end');
    
    var rects = user_heatMap.append('g')
						 .attr('class','user_freqRects')
						 .selectAll('.user_freqRect')
	    				 .data(frequency)
	    				 .enter()
	    				 .append('rect')
	    				 .attr('x',function(d){return user_x(d.Line);})
	    				 .attr('y',function(d){return user_y(d.Weekday)})
	    				 .attr('rx',4)
	    				 .attr('ry',4)
	    				 .attr('class',function(d){return 'user_freqRect.'+d.Line})
	    				 .attr('width',gridWidth-2)
	    				 .attr('height',gridHeight-5)
	    				 .style('fill',function(d){return rectColor(d.percentage)})
	    				 .on('mouseover',function(d){moveMarker(d.percentage);})
	    				 .on('mouseout',function(d){
	    				 	user_heatMap.selectAll('.user_temp').remove();
	    				 });
	
	addLineargradient();
	
	function addLineargradient(){
	  var linearGradient = user_heatMap.append('g')
							  		.attr('class','user_linearGradient')
							  		.attr('transform',"translate(" + (gridWidth*24)+ ","+ user_font_size*2+")")
							  		.append('linearGradient')
							        .attr('id', 'linearColor')
							        .attr('x1', '0%')
							        .attr('y1', '0%')
							        .attr('x2', '0%')
							        .attr('y2', '100%');
	  
	  var stop1 = linearGradient.append('stop')
						        .attr('offset', '0%')
						        .style('stop-color', '#fff9f9');
	  
	  var stop2 = linearGradient.append('stop')
						        .attr('offset', '100%')
						        .style('stop-color', '#e50000');
	  
	  var colorRect = d3.select('.user_linearGradient')
				  		.append('rect')
				        .attr('width', gridWidth*2/3)
				        .attr('height', gridHeight*4)
				        .attr('x', 0)
				        .attr('y', 0)
				        .attr('stroke', 'gray')
				        .style('fill', 'url(#' + linearGradient.attr('id') + ')');
	}
    
    function moveMarker(pos){
      	
      	var markerY=d3.scale.linear().range([0,gridHeight*4]).domain([minFreq,maxFreq]);
	    
	    user_heatMap.select('.user_linearGradient')
			    .append('line')
			    .attr('class','user_temp')
			    .attr('id','line')
			    .attr('x1',0)
			    .attr('x2',gridWidth*2/3)
			    .attr('y1',markerY(pos))
			    .attr('y2',markerY(pos))
			    .attr('stroke-width','1.5px')
			    .attr('stroke','black');
	    
	    user_heatMap.select('.user_linearGradient')
	    .append('text')
	    .attr('class','user_temp')
	    .attr('id','user_text')
	    .attr('x',gridWidth*2/3)
	    .attr('y',markerY(pos))
	    .text(pos+'%')
	    .attr('font-size',user_font_size);
  };
}

function user_drawSubmap(user_svg)
{
	console.log('start user_drawSubmap');
	var mapScale = 40000;

   // SUBWAY
	var projection = d3.geo.mercator()
					.center([-73.955, 40.678])
		            .translate([user_width*2/3, subWayHeight*2/3])
		            .scale([mapScale]);
               
	var path = d3.geo.path()
            	.projection(projection);
	
	user_subwayMap=user_svg.append('g').attr('class','user_subwayMap');
	NYC();
	PATHS();
	lineStart();

	// NYC MAP
    function NYC()
    {
    	d3.json('./data/nyc_boroughs.json',function(err,nyc_boroughs)
    	{
    	if(err) console.log(err);
    	user_subwayMap.append('g')
					 .attr('class','user_NYC')
					 .selectAll("path.user_borough_map")
		             .data(topojson.feature(nyc_boroughs[0], nyc_boroughs[0].objects.new_york_city_boroughs).features)
		             .enter()
		             .append("path")
		             .attr("d", path)
		             .attr("class", "user_borough_map")
		             .style('opacity',0.1);
    	});
    }

    function PATHS(){
    // lines
    d3.json("./data/paths.json",function(error, subway)
	{
		if(error) throw error;
    	var subwayLines=user_subwayMap.append('g')
    				.attr('class','user_subwayLines')
    				.selectAll('.user_subWayLine')
    				 .data(subway.features)
    				 .enter()
    				 .append('path')
    				 .attr('class','user_subWayLine')
    				 .attr('d',path)
    				 .attr('id',function(d){return 'user_'+d.properties.lines[0];})
    				 .style('stroke',function(d){return getColor(d.properties.lines[0]);})
    				 .style('stroke-width',3)
    				 .style('fill-opacity',0)
    				 .style('stroke-opacity',0.6)
    				 .style('cursor','pointer')
    				 .on('mouseover',function(d){
	        			console.log(d);
	        			console.log('stops: '+d.properties.lines[0]);
	   					user_highLightLine(d.properties.lines[0]);
	        		})
	        		.on('mouseout',function(){
	    				d3.select('.user_temp_rect').remove();
	    			});
    });
}
  
  function lineStart(){
    //line_starts
    d3.csv('./data/stops.csv',function(err,stops){
    	if(err) console.log(err);
        user_subwayMap.append('g')
        		.attr('class','user_starts')
        		.selectAll('.user_start')
        		.data(stops)
        		.enter()
        		.append('text')
        		.attr('class','user_start')
        		.attr('x',function(d){
        			return projection([d.Long,d.Lat])[0]})
        		.attr('y',function(d){
        			return projection([d.Long,d.Lat])[1]})
        		.attr('id',function(d,i){return d.Line;})
        		.attr('fill',function(d){return user_lineColor[getIndex(d.Line)]})
        		.text(function(d){return d.Line;})
        		.style('cursor','pointer')
        		.on('mouseover',function(d){
        			console.log(d);
        			console.log('stops: '+d.Line);
   					user_highLightLine(d.Line);
        		})
        		.on('mouseout',function(){
    				d3.select('.user_temp_rect').remove();
    			});
    });
}
    //   //stops
    // d3.csv('subway_map.csv',function(err,stops){
    // 	if(err) console.log(err);
    // 	console.log(stops);
    //     user_subwayMap.append('g')
    //     		.attr('class','stops')
    //     		.selectAll('.station')
    //     		.data(stops)
    //     		.enter()
    //     		.append('circle')
    //     		.attr('class','station')
    //     		.attr('cx',function(d){return projection([d.Long,d.Lat])[0]})
    //     		.attr('cy',function(d){return projection([d.Long,d.Lat])[1]})
    //     		.attr('r',3)
    //     		.attr('id',function(d,i){return d.Line+' '+i;})
    //     		.attr('fill',function(d){return user_lineColor[getIndex(d.Line)]})
    //     		.on('mouseover',function(d){
    //     			console.log(d);
    //     			console.log('stops: '+d.Line);
   	// 				highLightLine(d.Line);
    //     		})
    //     		.on('mouseout',function(){
    // 				d3.select('.temp_rect').remove();
    // 			});
    // })
       
   function getColor(line)
   {
	   	return user_lineColor[getIndex(line)];
   	}
   
   function getIndex(line)
   {
   	for(var i=0;i<user_lines.length;i++)
   	   {
   	   	if(line.localeCompare(user_lines[i])==0)
   	   	{
   	   		return i;
   	   	}
   	   }
   }			  
}

function user_highLightLine(line)
{
	user_heatMap.append('rect')
			.attr('class','user_temp_rect')
			.attr('x',function(){return user_x(line);})
			.attr('y',gridHeight/2)
			.attr('width',gridWidth)
			.attr('height',7*gridHeight)
			.attr('fill-opacity',0)
			.attr('stroke-width',3)
			.attr('stroke','black');
}
   				

