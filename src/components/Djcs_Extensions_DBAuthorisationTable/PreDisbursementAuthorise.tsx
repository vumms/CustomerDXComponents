// @ts-nocheck 
// Import MUI libraries
import {
  GridColDef,
  GridRowsProp,  
  DataGrid,  
  GridPreProcessEditCellProps,
  GridCellEditStopParams,
  GridRowId,  
  GridToolbar,
  MuiEvent,
} from '@mui/x-data-grid';
import { Box } from '@mui/material';

// Import Pega components
import { 
  Button,   
  Flex,  
  RadioButtonGroup,
  RadioButton,
  Modal,   
  Card,
  CardContent, 
  TextArea,   
  useModalManager,
  useModalContext, } from '@pega/cosmos-react-core';

// import styling  
import { StyledBox, StyledWrapper } from './styles';

// import core React.JS
import { useEffect, useState, useCallback, useMemo } from "react";

// import functions from utils
import { getDisbursementEmbeddedData, 
          getSelectedRows, 
          getUnSelectedRows, 
          getDataPageResults, 
          getDisbursementDetailsDataAsRowData,
          getPreSelectedTableDataListIds,
        } from './utils';

// Props from the config.json and any additional props to be loaded here
type Props = {
  pConnectProp: any;
  embedDataPageProp: string;
  paginationSizeProp: string;
  disbursementDetailsDataPageProp: any;
}

// Modal dialog function for View more details of each row   
const ShowViewMoreDetailModal = ( props ) => {
  console.log(props);    
  const [disbursementDetails, setDisbursementDetails] = useState();  
  const { dismiss } = useModalContext();
  
  const columns: GridColDef[] = [
    { field: 'disbursementId', headerName: 'Disbursement ID', width: 120, editable: false },
    { field: 'enforcementFee', headerName: 'Enforcement fee', width: 120, editable: false },
    { field: 'fineAmount', headerName: 'Fine Amount', width: 120, editable: false },
    { field: 'infringementAmount', headerName: 'Infringement amount', width: 120, editable: false },                               
    { field: 'obligationNumber', headerName: 'Obligation number', width: 120, editable: false },
    { field: 'prnAmount', headerName: 'Prn amount', width: 120, editable: false },
    { field: 'registrationFee', headerName: 'Registration fee', width: 120, editable: false },
    { field: 'totalPaid', headerName: 'Total Paid', width: 120, editable: false },
  ];

  // Actions required for the modal dialog
  const actions = useMemo(() => {
    return (
        <Button onClick={() => { dismiss(); }}>
          Close
        </Button>
    );
  }, [dismiss]);

  // PCore API to retrieve the data for view details
  const getDisbursementDetailsTableData = useCallback(() => {    
    // Set the disbursementID parameter from the selected row data 'reference' property 
    props.disbursementDetailsDataPageProp.parameters['DisbursementID'] = props.selectedRowsData['reference'];
    // Call the PCore API to retrieve the data    
    getDataPageResults(props.pConnectProp, props.disbursementDetailsDataPageProp).then(data => {                  
      setDisbursementDetails(getDisbursementDetailsDataAsRowData(data));
    });  
  }, [props.pConnectProp, props.disbursementDetailsDataPageProp, props.selectedRowsData]);

  // Load the data before the modal is rendered
  useEffect(() => {    
    getDisbursementDetailsTableData();    
  }, [props.pConnectProp, getDisbursementDetailsTableData]);
  
  return (      
    <Modal
      actions={actions}
      autoWidth={false}
      stretch={false}
      center={false}  
      heading='View details'   
      id='rowDetailModal'
    >
      <form>    
        <Box sx={{ height: 600, width: '100%' }}>                       
          <div style={{ height: 500, width: '100%' }}>
            <h1>Disbursement details</h1>
            <DataGrid
              rows={disbursementDetails}
              columns={columns}
              slots={{
                toolbar: GridToolbar,
              }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                },
              }}
            />    
          </div>
        </Box>                  
      </form>
    </Modal> 
  );   
}

// Modal dialog function for Bulk update  
const ShowBulkUpdateModalDialog = ( props:any) => {
  const { dismiss } = useModalContext();
  // Modal form content id defined
  const [modalFormContent, setModalFormContent] = useState({ BulkUpdateCommentsField: '',     
    rbRowSelection: '', rbSelRows: '', rbUnSelRows: '', 
  });  

  // Modal action buttons function
  const actions = useMemo(() => {
    // Function called to collect required information before updating REDUX store
    const updateTableRows = () => {
      // Read all the modal form data
      const commentsToUpdate = modalFormContent.BulkUpdateCommentsField;
      // Default selection is unselected table rows
      let rowsToBeUpdated = props.unSelectedRowsParam;
      if(modalFormContent.rbSelRows === 'on') {
        rowsToBeUpdated = props.selectedRowsParam;
      } 
      if(modalFormContent.rbUnSelRows === 'on') {
        rowsToBeUpdated = props.unSelectedRowsParam;
      } 
  
      // Update the comments field on all the user selected rows
      rowsToBeUpdated.forEach((row:any) => {      
        const newCommentValue = commentsToUpdate;
        const rowId = row.id;
        const indexOfRow = props.disbursementTableData.findIndex((obj:any) => obj.id === rowId);
        props.updateComments(indexOfRow, newCommentValue);
      });
      props.refreshTableData(); // refresh the table data
      dismiss(); // Close the window
    }
    return (
      <>
        <Button
          onClick={() => {              
            dismiss();  // Close the window            
          }}
        >
          Close
        </Button>
        <Button variant='primary' onClick={updateTableRows} disabled={modalFormContent.BulkUpdateCommentsField === ''}>
          Update
        </Button>
      </>
    );
  }, [dismiss, modalFormContent, props]
);

  // Text and TextArea input element change event
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setModalFormContent({ ...modalFormContent, [event.target.id]: event.target.value });    
  };

  // Modal component 
  return ( 
    <Modal           
      actions={actions}
      autoWidth={false}
      stretch={false}
      center={false}  
      heading='Bulk update modal'   
      id='bulkUploadModalId'                   
     >
      <Card>
        <CardContent>
          <form>                    
            <TextArea
              label='Enter comments for bulk update'
              name='bulkUpdateCommentsField'                      
              defaultValue={modalFormContent.BulkUpdateCommentsField}
              id="BulkUpdateCommentsField"
              required:any='true'     
              resizable:any='true'                                                             
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                handleInputChange(e)
              }
            />                         
            <RadioButtonGroup                        
              label='Select one to bulk update comments?'
              name='typeOfUpdate'                                                                                                                        
              info='Select one of the above item to update the comments'
              onClick={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                handleInputChange(e)
              }                               
            >
              {/* <RadioButton label='All rows' id='rbAllRows' defaultChecked /> */}
              <RadioButton label='Selected rows' id='rbSelRows' />
              <RadioButton label='Un-Selected rows' id='rbUnSelRows' defaultChecked />
            </RadioButtonGroup>                       
          </form>
        </CardContent>
      </Card>
    </Modal>     
  );   
}

// Main component code starts here
export default function PreDisbursementAuthorise(props: Props) {  
  /* 
    TODO: paginationSizeProp value is unable to set on the component due to some warning, have to investigate more on MUI component
          - disbursementDetailsDataPageProp props is used in the modal dialog 
          REMOVE the eslint no-unused-vars once the above two props are sorted out
  */
/* eslint-disable @typescript-eslint/no-unused-vars */
  const { 
      embedDataPageProp,
      pConnectProp,
      paginationSizeProp,      
      disbursementDetailsDataPageProp,
  } = props;       
/* eslint-enable @typescript-eslint/no-unused-vars */

  // Main table rows are stored in the disbursementTableData state
  const [disbursementTableData, setDisbursementTableData] = useState<GridRowsProp>([]);
  // User selected rows are stored in the rowSelectionModel state
  // TODO const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);  
  // Use below state to store the user selected rows
  const [selectionModel, setSelectionModel] = useState([]);  
  // pConnect pageRef is maintained in the below state
  const [pageRef, setPageRef] = useState('');  
  const { create } = useModalManager(); 

  /* Function for PConnect API call to update the comments field for selected 
  row Index and comments value entered by a user */
  const updateComments = async (rowIndex: number, newComment: string) => {    
    const embedObject = `${embedDataPageProp}[${rowIndex}]`;              // Create a string object with row index
    const embedPageReference = `${pageRef}.${embedObject}`;               // pageReference to reference to current embedded object    
    try {    
      // Have to set the page reference to point to the embedded data object page reference
      // Due to bug in the product, we have to use the below code as workaround to bypass the bug in the product, INC to be raised
      pConnectProp()._pageReference = embedPageReference;
      // Call API to update the comment field
      pConnectProp().getActionsApi().updateFieldValue('.comment', newComment, 
      {
        removePropertyFromChangedList: false,
        skipDirtyValidation: false
      });
      // Reset page reference back to original reference
      pConnectProp()._pageReference = pageRef;
      // Lets update the state disbursementTableData with new comments value to reflect the changes in the rendered table
      disbursementTableData[rowIndex].comments = newComment;  
    } catch (error) {
      console.log(error);
    } 
  }

   /* Function for PConnect API call to update the select field for selected records by a user */
  const updateSelect = async (rowIndex: number, selectState: boolean) => {    
    const embedObject = `${embedDataPageProp}[${rowIndex}]`;          // Create a string object with row index
    const embedPageReference = `${pageRef}.${embedObject}`;           // pageReference to reference to current embedded object 
    try {    
      // Have to set the page reference to point to the embedded data object page reference
      // Due to bug in the product, we have to use the below code as workaround to bypass the bug in the product, INC to be raised
      pConnectProp()._pageReference = embedPageReference;
      // Call API to update the Select field
      pConnectProp().getActionsApi().updateFieldValue('.Select', selectState);
      // Reset page reference back to original reference
      pConnectProp()._pageReference = pageRef;      
    } catch (error) {
      console.log(error);
    } 
  }

  // Click event to view details of the table row
  const handleViewDetailsClick = (id: GridRowId) => () => {    
    // Get the selected row data details using the row id
    const selectedRowsData = disbursementTableData.find((row) => row.id === id.toString());      
    // Call the modal dialog window and pass the props and required parameters
    create(ShowViewMoreDetailModal, { ...props, selectedRowsData }); 
  };
  
  // Table columns definition
  const columns: GridColDef[] = [
    // Below column is to show visual cue of the selected state to be retained
    { field: 'select', headerName: 'isAccepted', type: 'boolean', width: 150 },
    // Comments field column
    {
      field: 'comment',
      headerName: 'Comments',
      type: 'string',      
      width: 360,
      editable: true,
      preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {        
        const hasError = params.props.value.length == 0; // Empty comments check
        // Now check if the entered comments row is selected from selectionModel  
        if(hasError && !(selectionModel.find((sRow) => sRow === params.id) == undefined)) { // If true, meaning its empty                  
            return { ...params.props, error: hasError };
        }   
      }        
    },          
    { field: 'beneficiary_type', headerName: 'Beneficiary type', width: 120, editable: false },
    { field: 'beneficiary_name', headerName: 'Beneficiary name', width: 120, editable: false },
    { field: 'reference', headerName: 'Beneficiary ID', width: 120, editable: false },    
    {
      field: 'amount',
      headerName: 'Amount',
      type: 'number',
      width: 120,
      editable: false,
      valueFormatter: (params) => {
        return new Intl.NumberFormat('en', {
            style: 'currency',
            currency: 'USD',        // if we use AUD current the formatted value would show A$ prefixed
            minimumFractionDigits: 2,
        }).format(params);
      }
    },
    { field: 'type', headerName: 'Type', width: 120, editable: false },    
    { field: 'debtor_id', headerName: 'Disbursement ID', width: 120, editable: false },    
    { field: 'sts', headerName: 'Status', width: 120, editable: false },    
    { 
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        return [          
          <Button variant='link'
            onClick={handleViewDetailsClick(id)}
          >
            View details
          </Button>,          
        ];
      }
    },                       
  ];

  // Reusable method to refresh the table data from embedded data modal
  const refreshTableData = useCallback(() => {      
    // Below method call directly reads from the embedded data page
    getDisbursementEmbeddedData(pConnectProp, embedDataPageProp).then(data => {                  
      setDisbursementTableData(data); // set the data to the state object
      // Set preselected table checkbox column
      const preSelectedTableTableDataListIds = getPreSelectedTableDataListIds(data);
      // Always set SelectionModel with preselected ids so when the page is reloaded or  it retains the checked status
      setSelectionModel(preSelectedTableTableDataListIds); 
    });
  }, [pConnectProp, embedDataPageProp])

  useEffect(() => {
    /* TODO: Below method is called because it's reused elsewhere when we introduce table refresh button, 
    if we don't use the table refresh button, then we should move the function inside useEffect to avoid 
    hooks dependency and then remove the refreshTableData() function outside this useEffect */
    refreshTableData();

    // Set the page reference only once if its empty or undefined  
    if(!pageRef) {
      setPageRef(pConnectProp().getPageReference());
      /*  Set the tree manager context once, this is very important to generate the page instructions
          Without this below line of code, the pageInstructions will not be generated 
          and user entered data will not be saved to the case */
      (window as any).PCore.getContextTreeManager().addPageListNode(
        pConnectProp().getContextName(), 
        pConnectProp().getPageReference(), 
        pConnectProp().viewName, 
        `.${embedDataPageProp}`);
    }
  }, [pConnectProp, pageRef, embedDataPageProp, refreshTableData]);

  // Click event of bulk update button action
  const handleOpenBulkUpdateClick = () => {
    // Get all selected and unselected rows   
    const selectedRowsParam = getSelectedRows(selectionModel, disbursementTableData);
    const unSelectedRowsParam = getUnSelectedRows(selectionModel, disbursementTableData);
    // Call the modal and pass props and other parameters required
    create(ShowBulkUpdateModalDialog, { ...props, selectedRowsParam, unSelectedRowsParam, disbursementTableData, pageRef, updateComments, refreshTableData });
  }

   // This method is triggered from onRowSelectionModelChange 
  const handleSelectionChange = (newSelection: any) => {
    let selectedState = true; // defaulted
    let indexOfSelectedRow = 0; // defaulted

    // Determine if a row was selected or unselected
    if (newSelection.length > selectionModel.length) {
      // Row selected, select state should be set to TRUE
      const added = newSelection.filter(id => !selectionModel.includes(id));
      // console.log('Selected row ID(s):', added);      
      indexOfSelectedRow = disbursementTableData.findIndex(obj => obj.id === added.toString());
      // console.log('Index of Selected row ID(s):', indexOfSelectedRow);
      selectedState = true;  // Set selected state to true      

    } else if (newSelection.length < selectionModel.length) {
      // Row unselected, select state should be set to FALSE
      const removed = selectionModel.filter(id => !newSelection.includes(id));
      // console.log('Unselected row ID(s):', removed);
      indexOfSelectedRow = disbursementTableData.findIndex(obj => obj.id === removed.toString());
      // console.log('Index of Unselected row ID(s):', indexOfSelectedRow);
      selectedState = false;  // Set selected state to false
    }
    console.log('Selected state: ', selectedState, ' Index of row: ', indexOfSelectedRow);
    // Call function to update case embedded data using PConnect API and construct page instructions
    updateSelect(indexOfSelectedRow, selectedState);
    // Lets update the disbursementTableData
    disbursementTableData[indexOfSelectedRow].select = selectedState;  
    setSelectionModel(newSelection);
  };
 
  // Main component return method
  return (
    <StyledWrapper>        
        <StyledBox>
            <Flex container={{ direction: 'row', gap: 1, pad: 1 }}>                                       
              {/* <Button variant='secondary' onClick={refreshTableData}>Refresh embedded data</Button>  */}
              <Button variant='secondary' onClick={() => {                            
                handleOpenBulkUpdateClick();
              }} >Bulk update</Button>    
            </Flex>
            <Box sx={{ height: 370, width: '100%' }}>
              <DataGrid 
                rows={disbursementTableData} 
                columns={columns}    
                initialState={{
                  pagination: { paginationModel: { pageSize: 5 } }, // TODO paginationSizeProp to be used here, there is some warning and error generated when props are used
                }}
                pageSizeOptions={[5, 10, 25, { value: -1, label: 'All' }]}      
                checkboxSelection 
                disableRowSelectionOnClick
                onCellEditStop={(params: GridCellEditStopParams, event: MuiEvent) => {
                  const activeSelectedRowId = params.row.id;                      
                  const activeSelectedRowComment = event.target.value;
                  const indexOfRow = disbursementTableData.findIndex(obj => obj.id === activeSelectedRowId);
                  updateComments(indexOfRow, activeSelectedRowComment); // Update comments 
                }} 
                rowSelectionModel={selectionModel}
                onRowSelectionModelChange={handleSelectionChange}                     
              />
          </Box>                       
        </StyledBox>    
    </StyledWrapper>
  )
}