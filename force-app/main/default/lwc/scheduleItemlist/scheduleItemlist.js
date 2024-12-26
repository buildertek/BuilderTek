import { LightningElement, wire } from 'lwc';
import getProjectTasks from '@salesforce/apex/scheduleItemcontroller.getProjectTasks';

const columns = [
    { label: 'Name', fieldName: 'url', type: 'url', typeAttributes: { label: { fieldName: 'Name' } } },
    { label: 'Status', fieldName: 'buildertek__Status__c', type: 'text' },
    { label: 'Project', fieldName: 'buildertek__Project__c', type: 'text' },
    { label: 'Schedule', fieldName: 'buildertek__Schedule__c', type: 'text' },
    { label: 'Start Date', fieldName: 'buildertek__Start__c', type: 'date' },
    { label: 'Finish Date', fieldName: 'buildertek__Finish__c', type: 'date' },
    { label: 'Completion', fieldName: 'buildertek__Completion__c', type: 'percent' }
];

export default class ScheduleItemlist extends LightningElement {
    columns = columns;
    data;
    error;

    @wire(getProjectTasks)
    wiredProjectTasks({ error, data }) {
        if (data) {
            this.data = data.map(row => ({
                ...row,
                url: `/s/project-task/${row.Id}`
            }));
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.data = undefined;
        }
    }
}