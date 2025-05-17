/**
 * @author Fabrizio Giordano (Fab)
 */
import global from './Global.js';
import $ from "jquery";


class FVView {

	// TODO define here the CONSTANT with DOM names used

	constructor(in_canvas) {
		if (global.debug) {
			console.log("[FVView::FVView]");
		}
		this._messagesMap = new Map();
		setInterval( () => { this.showMessageInQueue() }, 500)
		this.init(in_canvas);
	}

	init(in_canvas) {
		if (global.debug) {
			console.log("[FVView::init]");
		}
		this.canvas = in_canvas;

		this.container = $("#fabvcontainer")
		this.container.width(window.innerWidth)
		this.container.height(window.innerHeight)
		
		// this.controlpanel = document.getElementById('controlpanel');
		// this.datapanel = document.getElementById('datapanel');
		
		this.widthToHeight = 4 / 3;
	};

	addMessageToMessageQueue(msgId, message){
		this._messagesMap.set(msgId, message)
	}

	removeMessageToMessageQueue(msgId){
		this._messagesMap.delete(msgId)
	}

	showMessageInQueue(){
		$("#message").hide()
		$("#message").empty();
		if (this._messagesMap.size > 0){
			
			for (const [msgId, message] of this._messagesMap) {
				$("#message").append(`<p><span id='${msgId}'>${message}</span><p>`)
			}
			$("#message").show()
		}
	}

	fillVersion(version){
		$("#version").append(version)
	}

	get metadataPanelButton(){
		return $("#metadata_button");
	}

	get dataPanelDomId() {
		return 'datapanel';
	}

	addHipsButtonHandler(handler) {
		$("#hips_button").on("click", handler);
	}

	appendChild2(html) {
		$("#controlpanel2container").append(html);

	};

	append2Body(html) {
		$("body").append(html);

	};

	append2FabvContainer(html) {

		this.container.append(html);
	};

	append2DataPanel(html){
		$("#datapanel").append(html);
	}


	// dragControl(elmnt) {
	// 	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	// 	if (elmnt) {
	// 		// if present, the header is where you move the DIV from:
	// 		elmnt.onmousedown = dragMouseDown;
	// 	} else {
	// 		// otherwise, move the DIV from anywhere inside the DIV:
	// 		elmnt.onmousedown = dragMouseDown;
	// 	}

	// 	function dragMouseDown(e) {
	// 		e = e || window.event;
	// 		//		    e.preventDefault();
	// 		// get the mouse cursor position at startup:
	// 		pos3 = e.clientX;
	// 		pos4 = e.clientY;
	// 		document.onmouseup = closeDragElement;
	// 		// call a function whenever the cursor moves:
	// 		document.onmousemove = elementDrag;
	// 	}

	// 	function elementDrag(e) {
	// 		e = e || window.event;
	// 		e.preventDefault();
	// 		// calculate the new cursor position:
	// 		pos1 = pos3 - e.clientX;
	// 		pos2 = pos4 - e.clientY;
	// 		pos3 = e.clientX;
	// 		pos4 = e.clientY;
	// 		// set the element's new position:
	// 		elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
	// 		elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
	// 	}

	// 	function closeDragElement() {
	// 		// stop moving when mouse button is released:
	// 		document.onmouseup = null;
	// 		document.onmousemove = null;
	// 	}
	// };



	resize(in_gl) {
		var newWidth = window.innerWidth - 3;
		var newHeight = window.innerHeight - 3;

		this.container.width(newWidth)
		this.container.height(newHeight)

		this.canvas.width = newWidth;
		this.canvas.height = newHeight;
		in_gl.viewportWidth = this.canvas.width;
		in_gl.viewportHeight = this.canvas.height;

	};
}

export default FVView;