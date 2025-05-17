/**
 * @author Fabrizio Giordano (Fab)
 */
import '../../../css/controlpanelcontainer.css';
import '../../../css/style.css';
import $ from 'jquery';

class ControlPanelView {

	_html;

	constructor() {
		this._html = "<div id='controlButtonContainer'>" +
			"	<div id='hamburgerButton'>" +
			"		<span></span><span></span><span></span><span></span>" +
			"	</div>" +
			"	<img id='gotoButton' class='controlButton' src='images/new_search.png'/>" +
			"	<div id='gotoButtonText'>Search</div>" +
			"	<img id='cataloguesButton' class='controlButton' src='images/new_catalogue.png' />" +
			"	<div id='catalogueButtonText'>Overlay source catalogues on top of a map</div>" +
			"	<img id='footprintsButton' class='controlButton' src='images/new_footprints.png' />" +
			"	<div id='footprintButtonText'>Overlay observation footprints on top of a map</div>" +
			"	<img id='mapsButton' class='controlButton' src='images/new_maps.png' />" +
			"	<div id='mapsButtonText'>Sky map selection</div>" +
			"	<img id='settingsButton' class='controlButton' src='images/new_settings.png' />" +
			"	<div id='settingsButtonText'>Settings</div>" +
			"	<img id='cutoutButton' class='controlButton' src='images/new_scissors.png' />" +
			"	<div id='cutoutButtonText'>Data Explorer</div>" +
			"</div>" +
			"<div id='settings-popup'></div>";
		// this._html = "<div id='controlButtonContainer'>" +
		// 	"	<div id='hamburgerButton'>" +
		// 	"		<span></span><span></span><span></span><span></span>" +
		// 	"	</div>" +
		// 	"	<img id='gotoButton' class='controlButton' src='images/catbutton2.png'/>" +
		// 	"	<div id='gotoButtonText'>Search</div>" +
		// 	"	<img id='cataloguesButton' class='controlButton' src='images/catbutton2.png' />" +
		// 	"	<div id='catalogueButtonText'>Overlay source catalogues on top of a map</div>" +
		// 	"	<img id='footprintsButton' class='controlButton' src='images/imgbutton2.png' />" +
		// 	"	<div id='footprintButtonText'>Overlay observation footprints on top of a map</div>" +
		// 	"	<img id='mapsButton' class='controlButton' src='images/mapbutton2.png' />" +
		// 	"	<div id='mapsButtonText'>Sky map selection</div>" +
		// 	"	<img id='settingsButton' class='controlButton' src='images/settings.png' />" +
		// 	"	<div id='settingsButtonText'>Settings</div>" +
		// 	"	<img id='cutoutButton' class='controlButton' src='images/settings.png' />" +
		// 	"	<div id='cutoutButtonText'>Data Explorer</div>" +
		// 	"</div>" +
		// 	"<div id='settings-popup'></div>";
		
	}

	get html() {
		return this._html;
	}

	appendChild(html) {
		$("#controlpanel2container").append(html);
	};

	showPopup(html) {
		$("#settings-popup").empty();
		$("#settings-popup").append(html);
		$("#settings-popup").css("display", "block");
	}

	hidePopup() {
		$("#settings-popup").empty();
		$("#settings-popup").css("display", "none");
	}

	enableCutOutButton() {
		$("#cutoutButton").prop('disabled', false)
	}

	disableCutOutButton(){
		$("#cutoutButton").prop('disabled', true)
	}
	
	openDataExplorer(html)  {
		$("#controlButtonContainer").append(html);
	}



}
export default ControlPanelView;