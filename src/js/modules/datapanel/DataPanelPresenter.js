
import DataPanelView from "./DataPanelView.js";
import $ from "jquery";
import eventBus from "../../events/EventBus.js";
import FootprintSetCloseEvent from "../controlpanel/footprintpanel/events/FootprintSetCloseEvent.js";
import Catalogue from "../controlpanel/cataloguepanel/model/Catalogue.js";
import Source from "../controlpanel/cataloguepanel/model/Source.js";
import FootprintSet from "../controlpanel/footprintpanel/model/FootprintSet.js";
import Footprint from "../controlpanel/footprintpanel/model/Footprint.js";
import CatalogueCloseEvent from "../controlpanel/cataloguepanel/events/CatalogueCloseEvent.js";

class DataPanelPresenter {

    _view;
    _footprintsMap;
    _sourcesMap;
    _rootDomId;

    constructor(rootDomId) {
        this._rootDomId = rootDomId;
        this._view = new DataPanelView(rootDomId);;
        this._footprintsMap = new Map()
        this._sourcesMap = new Map()
        this.registerForEvents()
    }

    registerForEvents() {
        eventBus.registerForEvent(this, FootprintSetCloseEvent.name);
        eventBus.registerForEvent(this, CatalogueCloseEvent.name);
    }

    notify(event) {
        if (event instanceof FootprintSetCloseEvent) {
            this.removeDataset(event.footprintSet._name)
        } else if (event instanceof CatalogueCloseEvent) {
            this.removeDataset(event.catalogue._name)
        }
    }

    get view() {
        return this._view;
    }

    toggleView() {
        $("#" + this._rootDomId).toggle()
    }

    refresh(selectedFootprints, selectedSources) {
        this.refreshSelectedFootprints(selectedFootprints)
        this.refreshSelectedSources(selectedSources)
    }

    refreshSelectedSources(selections) {
        for (const [catalogue, sources] of selections.entries()) {
            if (!this._sourcesMap.has(catalogue)) {
                if (sources.length == 0) {
                    break;
                }
                this._sourcesMap.set(catalogue, sources)
                this.addNewSourceDataset(catalogue._name, catalogue._columns, sources, catalogue)
                catalogue.extAddSources2Selected(sources)
            } else {
                this.look4NewSources(catalogue, sources)
            }
        }
    }

    /**
     * 
     * @param {Map<FootprintSet, Footprint[]>} selections 
     */
    refreshSelectedFootprints(selections) {
        // console.log(selections)
        for (const [fpset, footprints] of selections.entries()) {
            if (!this._footprintsMap.has(fpset)) {
                if (footprints.length == 0) {
                    break;
                }
                this._footprintsMap.set(fpset, footprints)
                this.addNewFootprintDataset(fpset._name, fpset._columns, footprints, fpset)
                fpset.addFootprint2Selected(footprints)
            } else {
                this.look4NewFootprints(fpset, footprints)
            }
        }
    }


    /**
     * 
     * @param {String} datasetname 
     * @param {TapMetadataList} metadata 
     * @param {Footprint[]} footprints 
     * @param {FootprintSet} fpset 
     */
    addNewFootprintDataset(datasetname, metadata, footprints, fpset) {

        this._view.addNewTable(datasetname, metadata, footprints, fpset, this.footprintRemovedFromView, this.footprintHighlighted);
    }
    
    /**
     * 
     * @param {String} datasetname 
     * @param {TapMetadataList} metadata 
     * @param {Source[]} sources 
     * @param {Catalogue} catalogue 
     */
    addNewSourceDataset(datasetname, metadata, sources, catalogue) {

        this._view.addNewTable(datasetname, metadata, sources, catalogue, this.sourceRemovedFromView, this.sourceHighlighted);
    }
    
    

    /**
     * 
     * @param {Catalogue} catalogue 
     * @param {Source[]} sources 
     */
     look4NewSources(catalogue, sources) {
        const existingSources = this._sourcesMap.get(catalogue);
        for (let news of sources) {
            if (!existingSources.includes(news)) {
                this.add2ExistingDataset(catalogue._name, catalogue._columns, news, catalogue)
                this._sourcesMap.get(catalogue).push(news)
                catalogue.extAddSources2Selected(sources)
            }
        }
    }

    /**
     * 
     * @param {FootprintSet} fpSet 
     * @param {Footprint[]} footprints 
     */
    look4NewFootprints(fpSet, footprints) {
        const existingFootprint = this._footprintsMap.get(fpSet);
        for (let newf of footprints) {
            if (!existingFootprint.includes(newf)) {
                this.add2ExistingDataset(fpSet._name, fpSet._columns, newf, fpSet)
                this._footprintsMap.get(fpSet).push(newf)
                fpSet.addFootprint2Selected(footprints)
            }
        }
    }

    add2ExistingDataset(datasetname, metadata, footprint, fpset) {
        this._view.addEntry2Table(datasetname, metadata, footprint, fpset);
    }


    footprintRemovedFromView(fpset, footprint) {
        fpset.removeFootprintFromSelection(footprint)
    }

    footprintHighlighted(fpset, footprint, highlighted) {
        fpset.highlightFootprint(footprint, highlighted)
    }
    
    sourceRemovedFromView(catalogue, source) {
        catalogue.extRemoveSourceFromSelection(source)
    }

    sourceHighlighted(catalogue, source, highlighted) {
        catalogue.extHighlightSource(source, highlighted)
    }

    removeDataset(tableName) { // better ID set in the view
        this._view.removeTable(tableName)
    }
}

export default DataPanelPresenter;