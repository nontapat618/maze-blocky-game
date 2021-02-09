// Original JavaScript code by Chirp Internet: www.chirp.com.au
// Please acknowledge use of this code by including this header.

function Position(x, y) {
  this.x = x;
  this.y = y;
}

Position.prototype.toString = function() {
  return this.x + ":" + this.y;
};

function Mazing(id) {

  // bind to HTML element
  this.mazeContainer = document.getElementById(id);

  this.mazeScore = document.createElement("div");
  this.mazeScore.id = "maze_score";

  this.mazeMessage = document.createElement("div");
  this.mazeMessage.id = "maze_message";

  this.heroScore = this.mazeContainer.getAttribute("data-steps") - 2;

  this.maze = [];
  this.heroPos = {};
  this.heroHasKey = false;
  this.childMode = false;
  this.finish = false;

  this.utter = null;

  for(i=0; i < this.mazeContainer.children.length; i++) {
    for(j=0; j < this.mazeContainer.children[i].children.length; j++) {
      var el =  this.mazeContainer.children[i].children[j];
      this.maze[new Position(i, j)] = el;
      if(el.classList.contains("entrance")) {
        // place hero at entrance
        this.heroPos = new Position(i, j);
        this.maze[this.heroPos].classList.add("hero");
      }
    }
  }

  var mazeOutputDiv = document.createElement("div");
  mazeOutputDiv.id = "maze_output";

  mazeOutputDiv.appendChild(this.mazeScore);
  mazeOutputDiv.appendChild(this.mazeMessage);

  mazeOutputDiv.style.width = this.mazeContainer.scrollWidth + "px";
  this.setMessage("first find the key");

  this.mazeContainer.insertAdjacentElement("afterend", mazeOutputDiv);

  // activate control keys
  // this.keyPressHandler = this.mazeKeyPressHandler.bind(this);
  // document.addEventListener("keydown", this.keyPressHandler, false);
};

Mazing.prototype.enableSpeech = function() {
  this.utter = new SpeechSynthesisUtterance()
  this.setMessage(this.mazeMessage.innerText);
};

Mazing.prototype.setMessage = function(text) {
  this.mazeMessage.innerHTML = text;
  this.mazeScore.innerHTML = this.heroScore;
  if(this.utter) {
    this.utter.text = text;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(this.utter);
  }
};

Mazing.prototype.heroTakeTreasure = function() {
  this.maze[this.heroPos].classList.remove("nubbin");
  this.heroScore += 10;
  this.setMessage("yay, treasure!");
};

Mazing.prototype.heroTakeKey = function() {
  this.maze[this.heroPos].classList.remove("key");
  this.heroHasKey = true;
  this.heroScore--;
  this.mazeScore.classList.add("has-key");
  this.setMessage("you now have the key!");
};

Mazing.prototype.gameOver = function(text) {
  // de-activate control keys
  document.removeEventListener("keydown", this.keyPressHandler, false);
  this.setMessage(text);
  this.mazeContainer.classList.add("gameover");
  document.getElementById("startBuuton").disabled=true;
};
Mazing.prototype.gameFinish = function(text) {
  // de-activate control keys
  document.removeEventListener("keydown", this.keyPressHandler, false);
  this.setMessage(text);
  this.mazeContainer.classList.add("finished");
  document.getElementById("startBuuton").disabled=true;
};

Mazing.prototype.heroWins = function() {
  this.mazeScore.classList.remove("has-key");
  this.maze[this.heroPos].classList.remove("door");
  this.heroScore--;
  this.finish=true;
  this.gameFinish("you finished !!!");
};

Mazing.prototype.tryMoveHero = function(pos) {

  if("object" !== typeof this.maze[pos]) {
    return;
  }

  var nextStep = this.maze[pos].className;

  // before moving
  if(nextStep.match(/sentinel/)) {
    this.heroScore = Math.max(this.heroScore - 5, 0);
    if(!this.childMode && this.heroScore <= 0) {
      this.gameOver("sorry, you didn't make it");
    } else {
      this.setMessage("ow, that hurt!");
    }
    return;
  }
  if(nextStep.match(/wall/)) {
    this.gameOver("you hit the wall !!!");
    return;
  }
  if(nextStep.match(/exit/)) {
    if(this.heroHasKey) {
      this.heroWins();
    } else {
      this.gameOver("you need a key to unlock the door");
      return;
    }
  }

  // move hero one step
  this.maze[this.heroPos].classList.remove("hero");
  this.maze[pos].classList.add("hero");
  this.heroPos = pos;

  // after moving
  if(nextStep.match(/nubbin/)) {
    this.heroTakeTreasure();
    return;
  }
  if(nextStep.match(/key/)) {
    this.heroTakeKey();
    return;
  }
  if(nextStep.match(/exit/)) {
    return;
  }
  if(this.heroScore >= 1) {
    if(!this.childMode) {
      this.heroScore--;
    }
    if(!this.childMode && (this.heroScore <= 0)) {
      this.gameOver("sorry, you didn't make it");
    } else {
      this.setMessage("...");
    }
  }
};

Mazing.prototype.mazeKeyPressHandler = function(e) {
  var tryPos = new Position(this.heroPos.x, this.heroPos.y);
  switch(e.keyCode)
  {
    case 37: // left
      this.mazeContainer.classList.remove("face-right");
      tryPos.y--;
      break;

    case 38: // up
      tryPos.x--;
      break;

    case 39: // right
      this.mazeContainer.classList.add("face-right");
      tryPos.y++;
      break;

    case 40: // down
      tryPos.x++;
      break;

    default:
      return;

  }
  this.tryMoveHero(tryPos);
  e.preventDefault();
};

Mazing.prototype.start = async function() {

  var namesTarget =  document.getElementById('namesTarget');


  if(namesTarget.getElementsByClassName('name') && namesTarget.getElementsByClassName('name').length > 0 ) {
    var names = namesTarget.getElementsByClassName('name');
    
    for(const name of names) {
      console.log('start');

      await this.processCommand(this,name);
    }
  }

};

Mazing.prototype.processCommand = async function(maze,name) {
  
  console.log('processCommand');

  const walking = () => new Promise(resolve => {
    setTimeout(async function() {   
      resolve(maze.walking(maze,name));
    }, 500);  
  });
  
  await walking();

}

Mazing.prototype.walking = async function(maze,command) {

  console.log('Walking');

  let text = command.textContent;
  var tryPos = new Position(maze.heroPos.x, maze.heroPos.y);
  switch(text)
  {
    case 'Left': // left
      maze.mazeContainer.classList.remove("face-right");
      tryPos.y--;
      maze.tryMoveHero(tryPos);          
      break;

    case 'Up': // up
      tryPos.x--;
      maze.tryMoveHero(tryPos);    
      break;

    case 'Right': // right
      maze.mazeContainer.classList.add("face-right");
      tryPos.y++;
      maze.tryMoveHero(tryPos);    
      break;

    case 'Down': // down
      tryPos.x++;
      maze.tryMoveHero(tryPos);    
      break;

  }

  if(text.startsWith("Repeat Until Find Door")) {
    var repeatBlock = document.getElementById(command.id);
    var blocks = repeatBlock.getElementsByClassName('repeat-block');
    var breakBlock = repeatBlock.getElementsByClassName('break');
    if(breakBlock && breakBlock.length > 0) {
      while(!maze.heroHasKey) {
        for(const block of blocks) {
          await this.processLoopCommand(maze,block);
          console.log('eiei');
        }   
      }  
    } else {
      console.log('asdsadsa');
      while(!maze.finish) {
        for(const block of blocks) {
          await this.processLoopCommand(maze,block);
        }   
      }  
    }
    // const waitLoop = async () => new Promise(resolve => {
    //   maze.iterateWalkingForLoop(maze,blocks,0);
    //   resolve(10);
    // });
    // var ss = await waitLoop();  
  }

  return Promise.resolve(10);

};

Mazing.prototype.processLoopCommand = async function(maze,block) {
  
  const loopWalking = () => new Promise(resolve => {
    setTimeout(async function() {   
      resolve(maze.walking(maze,block));
    }, 500);  
  });
  
  await loopWalking();


}




// Mazing.prototype.iterateWalking = async function(maze,names,index) {
//   setTimeout(async function() {   
//     if (index < names.length) {
//       console.log('indexxxx' + index + "   " + new Date().getSeconds());
//       const waittt = async () => new Promise(resolve => {
//         var ss = maze.walking(maze,names[index],index);
//         resolve(ss);
//       })


//       var value = await waittt();
//       console.log(value);
//       maze.iterateWalking(maze,names,++index);        
//     } 

//   }, 1000)
// }

// var swap = false;
// Mazing.prototype.iterateWalkingForLoop = async function(maze,names,index) {
  
//   setTimeout(async function() {   
//     var ss = await maze.walking(maze,names[index],false); 
//     if(names.length == 2)  {
//       if(swap) {
//         ss = await maze.iterateWalkingForLoop(maze,names,0);
//         swap = false;
//       } else {
//         ss = await maze.iterateWalkingForLoop(maze,names,1);
//         swap = true;
//       }
//     } else {
//       ss = await maze.iterateWalkingForLoop(maze,names,index);
//     }
//   }, 1000)
// }


// Mazing.prototype.walking = async function(maze,command) {

//   let text = command.textContent;
//   var tryPos = new Position(maze.heroPos.x, maze.heroPos.y);
//   switch(text)
//   {
//     case 'Left': // left
//       maze.mazeContainer.classList.remove("face-right");
//       tryPos.y--;
//       maze.tryMoveHero(tryPos);          
//       break;

//     case 'Up': // up
//       tryPos.x--;
//       maze.tryMoveHero(tryPos);    
//       break;

//     case 'Right': // right
//       maze.mazeContainer.classList.add("face-right");
//       tryPos.y++;
//       maze.tryMoveHero(tryPos);    
//       break;

//     case 'Down': // down
//       tryPos.x++;
//       maze.tryMoveHero(tryPos);    
//       break;

//   }

//   if(text.startsWith("Repeat Until Find Door")) {
//     var repeatBlock = document.getElementById('block-repeat');
//     var blocks = repeatBlock.getElementsByClassName('repeat-block');
//     const waitLoop = async () => new Promise(resolve => {
//       maze.iterateWalkingForLoop(maze,blocks,0);
//       resolve(10);
//     });
//     var ss = await waitLoop();  
//   }

//   return Promise.resolve(10);

// };

Mazing.prototype.setChildMode = function() {
  this.childMode = true;
  this.heroScore = 0;
  this.setMessage("collect all the treasure");
};
