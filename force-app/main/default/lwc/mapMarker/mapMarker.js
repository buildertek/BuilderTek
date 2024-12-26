import { LightningElement, wire, track } from 'lwc';
import fetchProjectDetails from '@salesforce/apex/mapMarkerController.fetchProject';
import { setTabLabel, getFocusedTabInfo, setTabIcon } from "lightning/platformWorkspaceApi";

export default class mapMarker extends LightningElement {
    @track mapMarkers = [];
    @track filteredProjects = [];
    @track selectedProjectId;
    @track error;
    @track isLoading = true;

    connectedCallback() {
        getFocusedTabInfo().then((tabInfo) => {
            setTabLabel(tabInfo.tabId, "Project Map");
            setTabIcon(tabInfo.tabId, "standard:location");
        });
    }

    @wire(fetchProjectDetails)
    wiredProjects({ error, data }) {
        this.isLoading = true;
        if (data) {
            this.processProjectData(data);
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.mapMarkers = [];
            this.filteredProjects = [];
            console.error('Error fetching project', error);
        }
        this.isLoading = false;
    }

    processProjectData(data) {
        this.mapMarkers = data.map(project => ({
            location: {
                Street: project.buildertek__Address__c || '',
                City: project.buildertek__City_Text__c,
                State: project.buildertek__State__c,
                Country: project.buildertek__Country__c,
                PostalCode: project.buildertek__Zip__c
            },
            icon: 'custom:custom24',
            title: project.Name,
            value: project.Id,
            description: `${project.buildertek__Address__c}, ${project.buildertek__City_Text__c}, ${project.buildertek__State__c}, ${project.buildertek__Country__c}`
        }));
        this.filteredProjects = [...this.mapMarkers];
    }

    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        this.filteredProjects = this.mapMarkers.filter(project =>
            project.title.toLowerCase().includes(searchTerm) ||
            project.description.toLowerCase().includes(searchTerm)
        );
    }

    clearSearch() {
        this.template.querySelector('input[type="search"]').value = '';
        this.filteredProjects = [...this.mapMarkers];
    }

    handleMarkerSelect(event) {
        this.selectedProjectId = event.target.selectedMarkerValue;
    }

    handleProjectSelect(event) {
        this.selectedProjectId = event.currentTarget.dataset.id;
    }
}