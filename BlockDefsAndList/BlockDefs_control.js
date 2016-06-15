/* This file contains the implementations for Blocks in the control category.
 * Each has a constructor which adds the parts specific to the Block and overrides methods relating to execution.
 */



function B_WhenFlagTapped(x,y){
	HatBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"when"));
	this.addPart(new BlockIcon(this,VectorPaths.flag,TitleBar.flagFill,"flag",15));
	this.addPart(new LabelText(this,"tapped"));
}
B_WhenFlagTapped.prototype = Object.create(HatBlock.prototype);
B_WhenFlagTapped.prototype.constructor = B_WhenFlagTapped;
/* Triggers stack to start running. */
B_WhenFlagTapped.prototype.eventFlagClicked=function(){
	this.stack.startRun();
};
/* Does nothing. */
B_WhenFlagTapped.prototype.startAction=function(){
	return false; //Done running. This Block does nothing except respond to an event.
};



function B_Wait(x,y){
	CommandBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"wait"));
	this.addPart(new NumSlot(this,1,true)); //Must be positive.
	this.addPart(new LabelText(this,"secs"));
}
B_Wait.prototype = Object.create(CommandBlock.prototype);
B_Wait.prototype.constructor = B_Wait;
/* Records current time. */
B_Wait.prototype.startAction=function(){
	var mem=this.runMem;
	mem.startTime=new Date().getTime();
	mem.delayTime=this.slots[0].getData().getValueWithC(true)*1000;
	return true; //Still running
};
/* Waits until current time exceeds stored time plus delay. */
B_Wait.prototype.updateAction=function(){
	var mem=this.runMem;
	if(new Date().getTime()>=mem.startTime+mem.delayTime){
		return false; //Done running
	}
	else{
		return true; //Still running
	}
};



function B_WaitUntil(x,y){
	CommandBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"wait until"));
	this.addPart(new BoolSlot(this));
}
B_WaitUntil.prototype = Object.create(CommandBlock.prototype);
B_WaitUntil.prototype.constructor = B_WaitUntil;
/* Checks condition. If true, stops running; if false, resets Block to check again. */
B_WaitUntil.prototype.startAction=function(){
	var stopWaiting=this.slots[0].getData().getValue();
	if(stopWaiting){
		return false; //Done running
	}
	else{
		this.running=0; //startAction will be run next time, giving Slots ability to recalculate.
		this.clearMem(); //runMem and previous values of Slots will be removed.
		return true; //Still running
	}
};



function B_Forever(x,y){
	LoopBlock.call(this,x,y,"control",false); //Bottom is not open.
	this.addPart(new LabelText(this,"forever"));
}
B_Forever.prototype = Object.create(LoopBlock.prototype);
B_Forever.prototype.constructor = B_Forever;
/* Begins executing contents. */
B_Forever.prototype.startAction=function(){
	this.blockSlot1.startRun();
	return true; //Still running
};
/* Continues executing contents. If contents are done, runs them again. */
B_Forever.prototype.updateAction=function(){
	if(!this.blockSlot1.updateRun()){
		this.blockSlot1.startRun();
	}
	return true; //Still running. Never stops.
};



function B_Repeat(x,y){
	LoopBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"repeat"));
	this.addPart(new NumSlot(this,10,true,true)); //Positive integer.
}
B_Repeat.prototype = Object.create(LoopBlock.prototype);
B_Repeat.prototype.constructor = B_Repeat;
/* Prepares counter and begins executing contents. */
B_Repeat.prototype.startAction=function(){
	var mem=this.runMem;
	mem.times=this.slots[0].getData().getValueWithC(true,true);
	mem.count=0;
	this.blockSlot1.startRun();
	return true; //Still running
};
/* Update contents. When they finish, increment counter and possibly run them again. */
B_Repeat.prototype.updateAction=function(){
	if(!this.blockSlot1.updateRun()){
		var mem=this.runMem;
		mem.count++;
		if(mem.count>=mem.times){
			return false; //Done running
		}
		else{
			this.blockSlot1.startRun();
		}
	}
	return true; //Still running
};



function B_RepeatUntil(x,y){
	LoopBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"repeat until"));
	this.addPart(new BoolSlot(this));
}
B_RepeatUntil.prototype = Object.create(LoopBlock.prototype);
B_RepeatUntil.prototype.constructor = B_RepeatUntil;
/* Checks condition and either stops running or executes contents. */
B_RepeatUntil.prototype.startAction=function(){
	var stopRepeating=this.slots[0].getData().getValue();
	if(stopRepeating){
		return false; //Done running
	}
	else{
		this.blockSlot1.startRun();
		return true; //Still running
	}
};
/* Updates contents until completed. Then resets Block to condition can be checked again. */
B_RepeatUntil.prototype.updateAction=function(){
	if(!this.blockSlot1.updateRun()){
		this.running=0; //startAction will be run next time, giving Slots ability to recalculate.
		this.clearMem(); //runMem and previous values of Slots will be removed.
	}
	return true; //Still running
};



function B_If(x,y){
	LoopBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"if"));
	this.addPart(new BoolSlot(this));
}
B_If.prototype = Object.create(LoopBlock.prototype);
B_If.prototype.constructor = B_If;
/* Either stops running or executes contents. */
B_If.prototype.startAction=function(){
	var check=this.slots[0].getData().getValue();
	if(check){
		this.blockSlot1.startRun();
		return true; //Still running
	}
	else{
		return false; //Done running
	}
};
/* Continues executing contents until completed. */
B_If.prototype.updateAction=function(){
	return this.blockSlot1.updateRun();
};



function B_IfElse(x,y){
	DoubleLoopBlock.call(this,x,y,"control","else");
	this.addPart(new LabelText(this,"if"));
	this.addPart(new BoolSlot(this));
}
B_IfElse.prototype = Object.create(DoubleLoopBlock.prototype);
B_IfElse.prototype.constructor = B_IfElse;
/* Starts executing one of two BlockSlots. */
B_IfElse.prototype.startAction=function(){
	this.runMem.check=this.slots[0].getData().getValue();
	if(this.runMem.check){
		this.blockSlot1.startRun();
		return true; //Still running
	}
	else{
		this.blockSlot2.startRun();
		return true; //Still running
	}
};
/* Continues executing one of two BlockSlots until completion. */
B_IfElse.prototype.updateAction=function(){
	if(this.runMem.check){
		if(!this.blockSlot1.updateRun()){
			return false; //Done running
		}
	}
	else{
		if(!this.blockSlot2.updateRun()){
			return false; //Done running
		}
	}
	return true; //Still running
};
///// <Not implemented> /////
function B_WhenIAmTapped(x,y){
	HatBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"when I am"));
	var dS=new DropSlot(this,null,Slot.snapTypes.bool);
	dS.addOption("tapped",new SelectionData("tapped"));
	dS.addOption("pressed",new SelectionData("pressed"));
	dS.addOption("released",new SelectionData("released"));
	this.addPart(dS);
}
B_WhenIAmTapped.prototype = Object.create(HatBlock.prototype);
B_WhenIAmTapped.prototype.constructor = B_WhenIAmTapped;

function B_WhenIReceive(x,y){
	HatBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"when I receive"));
}
B_WhenIReceive.prototype = Object.create(HatBlock.prototype);
B_WhenIReceive.prototype.constructor = B_WhenIReceive;

function B_Broadcast(x,y){
	CommandBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"broadcast"));
}
B_Broadcast.prototype = Object.create(CommandBlock.prototype);
B_Broadcast.prototype.constructor = B_Broadcast;

function B_BroadcastAndWait(x,y){
	CommandBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"broadcast"));
	this.addPart(new LabelText(this,"and wait"));
}
B_BroadcastAndWait.prototype = Object.create(CommandBlock.prototype);
B_BroadcastAndWait.prototype.constructor = B_BroadcastAndWait;

function B_Message(x,y){
	ReporterBlock.call(this,x,y,"control",Block.returnTypes.string);
	this.addPart(new LabelText(this,"message"));
}
B_Message.prototype = Object.create(ReporterBlock.prototype);
B_Message.prototype.constructor = B_Message;









function B_StopAll(x,y){//No bottom slot
	CommandBlock.call(this,x,y,"control",false);
	this.addPart(new LabelText(this,"stop"));
}
B_StopAll.prototype = Object.create(CommandBlock.prototype);
B_StopAll.prototype.constructor = B_StopAll;

function B_StopAllBut(x,y){
	CommandBlock.call(this,x,y,"control");
	this.addPart(new LabelText(this,"stop"));
}
B_StopAllBut.prototype = Object.create(CommandBlock.prototype);
B_StopAllBut.prototype.constructor = B_StopAllBut;