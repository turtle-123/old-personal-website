/**
 * @file This is the main and should be the only javascript file for 
 * desktop Civgauge applications. 
 * 
 * @todo Search (CTRL+f) for 'No Mobile' to find aspects of the code
 * that should not be included on mobile devices
 *  
 * @todo Remove aspects of the code that read 'REMOVE'
 * 
 * before building the document
 * 
 * Sections of Document (CTRL+f):
 * - Initial Imports
 *  - css (Only in Development)
 *  - htmx
 * - Variables
 * - Helper Functions
 * - Custom
 * - Dialogs
 * - Alerts
 * - Accordions
 * - Inputs
 * - Document Listeners 
 * - General Javascript
 * @author Frank Brown
 */


import * as shared from './shared';

/**
 * Function to call on initial page load
 */
function onInitialPageLoad(_e:Event) {
shared.onNewContentLoaded();
}




window.addEventListener('DOMContentLoaded', onInitialPageLoad);    