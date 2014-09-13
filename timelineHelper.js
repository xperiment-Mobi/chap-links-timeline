var timelineHelper = ( function()
{

    var api = {};

    api.toAS3 = null;

    var timeline = null;
    var jsonData =
        [
            {
                "start": 10,
                "end": 20,
                "content": "a",
                "group": "group4",
                "type": "range"
            },
			 {
                "start": 10,
                "end": 20,
                "content": "b",
                "group": "group1",
                "type": "range"
            }
        ];

    var groupText = {};
    initStimTypes();

    function initStimTypes() {
        var stimuli = ["button", "combobox", "hideMouse", "inputText", "jpg", "keypress", "LAMS", "lineScale", "loading", "multipleNumberSelector", "sequentialCounter", "shape", "sound", "text", "TMS", "video"];
        var stim;
        for (var i = 0; i < stimuli.length; i++) {
            stim = stimuli[i];
            groupText[stim] = "<img src='/static/css/AcidJs.Ribbon/icons/16/" + stim + ".png' style='width:16px; height:16px; vertical-align: middle'/> ";
        }

        groupText["group1"]= '<img src="img/truck-icon.png" style="width:24px; height:24px; vertical-align: middle">Group 1';
    }

    google.load("visualization", "1");

    // Set callback to run when API is loaded
    google.setOnLoadCallback(drawVisualization);

    // Called when the Visualization API is loaded.
    function drawVisualization() {

        var options = {

            //set fixed time which cannot be moved left
            min: new Date(2014, 7, 13, 0, 0, 0),

            //default width of the chart ( height is auto )
            width: "100%",

            //set if if could be resized
            resizable: true,

            //set if the items are editable
            editable: true,

            eventMargin: 5,  // minimal margin between events
            eventMarginAxis: 0, // minimal margin beteen events and the axis

            showMajorLabels: false, //show detailed time string in axis
            axisOnTop: true,  //otherwise the axis will be at bottom

            //showCustomTime: true, // show a blue, draggable bar displaying a custom time
            //showCurrentTime: true, // show a red bar displaying the current time

            //the width of group label column ( optional )
            groupsWidth: "100px",

            //if allow items move across groups
            groupsChangeable: true,

            //set groups on left or right
            groupsOnRight: false, // or left

            //the minimum range of zoom in
            zoomMin: 10, // 10ms


            //show the navigation panel
            showNavigation: false,

            dragStep:10,

            groupText: groupText, //pass the group name text
            scale: 2,
            step: 5,
            zoomMax: 50000,
            sortableGroup: true
        };

        // Instantiate our timeline object.


        if (timeline)killTimeLine();
        api.timeline=timeline;
        timeline = new links.Timeline(document.getElementById('mytimeline'));

        //prepare data from JSON
        // for(var i=0,r; r = jsonData[i]; i++)
        // {
        //     //convert time string to time object
        //     jsonData[i].start = links.Timeline.parseJSONDate(r.start);
        //     jsonData[i].end = links.Timeline.parseJSONDate(r.end);
        // }

        // Draw our timeline with the created data and options

        timeline.draw(timeline.formatJsonData(options, jsonData), options, true);
        //timeline.deleteAllItems(); //a hack


        //confirm on delete
        links.events.addListener(timeline, 'delete', ItemDeleted);
        //on change, update json
        links.events.addListener(timeline, 'change', ItemsUpdated);

        links.events.addListener(timeline, 'reOrdered', ReOrdered);


    }

    function ReOrdered(data) {
        if(api.toAS3)   api.toAS3('orderChange', data.extra);
    }

    api.command = function(_command) {
        switch (_command) {
            case "zoom-in":
                timeline.zoom(0.4);
                break;
            case "zoom-out":
                timeline.zoom(-0.4);
                break;
            case "shift-left":
                timeline.move(-0.2);
                break;
            case "shift-right":
                timeline.move(+0.2);
                break;
            case "fit-everything":
                timeline.setVisibleChartRangeAuto();
                break;
        }
    }

    api.timelineItems = function(data, loc) {
        log('timeline items sent:',JSON.stringify(data),JSON.stringify(loc))
       // timeline.deleteAllItems();
        var stim;
        for (var i = 0; i < data.length; i++) {
            stim = data[i];

            timeline.addItem({
                "start":  timeline.getDateFromSecond(stim.start),
                "end":  timeline.getDateFromSecond(stim.end),
                "group": stim.group,
                "info": "<div id='peg'>" + stim.info + "</div>",
                "content":stim.info,
                "type": "range"
            });
			

    /*
            {
            "start": 80,
            "end": 90,
            "content": "",
            "group": "group2",
            "type": "range"
        }*/
        }
    }

    api.checkResize = function(){
        if(timeline)timeline.checkResize();
    }


    function killTimeLine() {
        if (timeline) {
            timeline.deleteAllItems();
            timeline = null;
        }
    }

    function ItemDeleted(myOptions, myJSON) {
        if (!confirm('Are you sure to delete this item?'))
            timeline.cancelDelete();
        else
            ItemsUpdated();
    }

    function ItemsUpdated(myOptions) {
        var selected = timeline.getSelectedItem();
        if(api.toAS3)    api.toAS3("timeChange",{
            "peg":selected.content,
            "start":selected.start*1000,
            "end":selected.end*1000
        })
    }



    return api;
}());
