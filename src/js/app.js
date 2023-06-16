$(function(){
    console.log(`Ready`);
    $vscroll = $('.cfl_main_container').vscroll({min: 280, max: 400, selected: 340});
    $vscroll.vscroll({selected: 390});
    $vscroll.vscroll({step: 3});
    $vscroll.on("cfl.changed", function(ev, value) { console.log(`New call: ${value}`) });
    // $vscroll.vscroll({cbSelected: function(ev, value) { console.log({ev, value}) }});
    $box = $('.box');
    $box.draggable();
});