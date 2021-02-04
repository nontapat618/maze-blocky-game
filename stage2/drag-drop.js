var names = document.querySelectorAll('.names .name');
[].forEach.call(names, function(name) {
  name.addEventListener('dragstart', function(e) {
      e.dataTransfer.setData("text/name", name.innerHTML)
  })
})






// Targets
// There are lots of ways we could make these functions more DRY, but they are spelled out here for clarity. 


// tells us whether a drag event is the right type
function hasData(type, e) {
    return (e.dataTransfer.types[0] == type)
}

// we want to call this from dragleave and drop
function onLeave(e) {
    e.target.classList.remove("dragover")
}

var namesTarget = document.getElementById("namesTarget")

namesTarget.addEventListener('dragover', function(e) {
    if (!hasData("text/name", e)) return
    e.preventDefault()
    return false
})

namesTarget.addEventListener('dragenter', function(e) {
    if (!hasData("text/name", e)) return
    e.target.classList.add("dragover")
})

namesTarget.addEventListener('dragleave', onLeave)
namesTarget.addEventListener('drop', function(e) {

    var namesTarget =  document.getElementById('namesTarget');
    if(namesTarget.getElementsByClassName('name') && namesTarget.getElementsByClassName('name').length < 40 ) {
        var data = e.dataTransfer.getData("text/name")
        var blockid = 'block' + (namesTarget.getElementsByClassName('name').length + 1);

        if('Repeat Until Find Door' == data) {
            var blockidRepeat = 'block-repeat';
            namesTarget.innerHTML += "<div id='" + blockidRepeat + "' class='name block-style repeat' onclick='deleteBlock(\"" + blockid + "\")' >" + data + "</div>";
            initDragAndDropOnRepeat(blockidRepeat);   
        } else {
            namesTarget.innerHTML += "<div id='" + blockid + "' class='name block-style' onclick='deleteBlock(\"" + blockid + "\")' >" + data + "</div>";    
        }
    }
  
    onLeave(e)
})


function initDragAndDropOnRepeat(blockidRepeatId) {


    var blockRepeat = document.getElementById(blockidRepeatId);

    blockRepeat.addEventListener('dragover', function(e) {
        console.log('block dragover');
        if (!hasData("text/name", e)) return
        e.preventDefault()
        return false
    })
    
    blockRepeat.addEventListener('dragenter', function(e) {
        console.log('block dragenter');
        if (!hasData("text/name", e)) return
        e.target.classList.add("dragover")
    })
    
    blockRepeat.addEventListener('dragleave', onLeave)
    blockRepeat.addEventListener('drop', function(e) {
        console.log('block drop');

        var block =  document.getElementById(blockidRepeatId);
        if(block.getElementsByClassName('name') && block.getElementsByClassName('name').length < 40 ) {
            var data = e.dataTransfer.getData("text/name")
            var blockid = 'block' + (namesTarget.getElementsByClassName('name').length + 1);
            block.innerHTML += "<div id='" + blockid + "' class='name block-style' onclick='deleteBlock(\"" + blockid + "\")' >" + data + "</div>"    
        }
        e.stopPropagation();
        onLeave(e)
    })
    


}


function deleteBlock(blockid) {
    var block = document.getElementById(blockid);
    block.remove();
}

