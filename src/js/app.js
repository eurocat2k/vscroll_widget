$(function(){
    console.log(`Ready`);
    $vscroll = $('.cfl_main_container').vscroll({min: 280, max: 400, selected: 340});
    $vscroll.vscroll({selected: 390});
    $box = $('.box');
    $box.draggable();
});