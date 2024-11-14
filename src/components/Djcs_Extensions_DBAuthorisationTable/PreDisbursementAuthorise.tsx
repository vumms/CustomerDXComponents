// @ts-nocheck
// Import MUI libraries
import {
  GridColDef,
  GridRowsProp,  
  DataGrid,  
  GridRowSelectionModel,
  GridPreProcessEditCellProps,
  GridCellEditStopParams,
  GridRowId,
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
  Table,
  useModalManager,
  useModalContext, } from '@pega/cosmos-react-core';

// import styling  
// import { StyledBox } from './styles';
import { styled } from '@mui/material/styles';
import StyledPegaExtensionsDBAuthoriseWrapper, {
  /* StyledTable, */  
} from './styles';

// import core React.JS
import { useEffect, useState, useCallback, useMemo } from "react";

// import utils
import { getDisbursementEmbeddedData, getSelectedRows, getUnSelectedRows } from './utils';

// TODO move this styling to style.ts
const StyledBox = styled('div')(({ theme }) => ({
  height: 400,
  width: '100%',  
  '& .MuiDataGrid-cell--editing': {
    backgroundColor: 'rgb(255,215,115, 0.19)',
    color: '#1a3e72',
    '& .MuiInputBase-root': {
      height: '100%',
    },
  },
  '& .Mui-error': {
    backgroundColor: 'rgb(255,18,28, 0.1)',
    color: theme.palette.error.main,
    ...theme.applyStyles('dark', {
      backgroundColor: 'rgb(126,10,15, 0)',
    }),
  },
}));

type Props = {
  pConnectProp: any;
  embedDataPageProp: string;
  paginationSizeProp: string;
}

// View more details modal dialog function 
const ShowViewMoreDetailModal = ( props:any ) => {
  console.log(props.selectedRowsData);    
  const { dismiss } = useModalContext();

  const actions = useMemo(() => {
    return (
        <Button
          onClick={() => {              
            dismiss();              
          }}
        >
          Close
        </Button>     
    );
  }, [dismiss]);

  return (      
    <Modal
      actions={actions}
      autoWidth={false}
      stretch={false}
      center={false}  
      heading='View details modal'   
      id='rowDetailModal'
    >
      <Card>
        <CardContent>
          <form>    
            <Flex container={{ direction: 'column', gap: 1 }}>                        
              <Table
                title='Breakdown of amount'
                hoverHighlight={false}                
                data={props.selectedRowsData?.detailsData}
                columns={[
                  { renderer: 'item', label: 'Item' },
                  { renderer: 'amt', label: 'Amount' },
                ]}
              />      
            </Flex>                  
          </form>
        </CardContent>
      </Card>
    </Modal> 
    
  );   
}

// Bulk update modal dialog function
const ShowBulkUpdateModalDialog = ( props:any) => {
  console.log(props);    
  const { dismiss } = useModalContext();
  // TODO below const to be revisited
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
  
      // Update the comments to all the rows
      rowsToBeUpdated.forEach((row:any) => {      
        const newCommentValue = commentsToUpdate;
        const rowId = row.id;
        const indexOfRow = props.disbursementTableData.findIndex((obj:any) => obj.id === rowId);
        console.log('Row to be updated=', row);
        console.log('New comments=', newCommentValue);
        console.log('RowId to be updated=', rowId);
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
  const { 
      embedDataPageProp,
      pConnectProp,
      paginationSizeProp,
  } = props;       

  const [disbursementTableData, setDisbursementTableData] = useState<GridRowsProp>([]);
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);  
  const [pageRef, setPageRef] = useState('');
  const { create } = useModalManager(); // Modal dialog  

  // TODO : Remove all console logs after development, paginationSizeProp variable had to used in the MUI grid
  console.log(paginationSizeProp);

  const updateComments = async (rowIndex: number, newComment: string) => {    
    const embedObject = `${embedDataPageProp}[${rowIndex}]`;    
    const embedPageReference = `${pageRef}.${embedObject}`;
    console.log("Page reference=", embedPageReference);
    try {    
      // Use the below code as workaround to bypass the bug in the product, INC to be raised
      pConnectProp()._pageReference = embedPageReference;
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

  const updateSelect = async (rowIndex: number, selectState: boolean) => {    
    const embedObject = `${embedDataPageProp}[${rowIndex}]`;    
    const embedPageReference = `${pageRef}.${embedObject}`;
    console.log("Page reference=", embedPageReference);
    try {    
      // Use the below code as workaround to bypass the bug in the product, INC to be raised
      pConnectProp()._pageReference = embedPageReference;
      pConnectProp().getActionsApi().updateFieldValue('.Select', selectState, 
      {
        removePropertyFromChangedList: false,
        skipDirtyValidation: false
      });
      // Reset page reference back to original reference
      pConnectProp()._pageReference = pageRef;
      // Lets update the state disbursementTableData with new comments value to reflect the changes in the rendered table
      disbursementTableData[rowIndex].select = selectState;       
    } catch (error) {
      console.log(error);
    } 
  }

  const handleViewDetailsClick = (id: GridRowId) => () => {
    console.log(id);    
    const selectedRowsData = disbursementTableData.find((row) => row.id === id.toString());  
    create(ShowViewMoreDetailModal, { ...props, selectedRowsData });
  };
  
  const columns: GridColDef[] = [
    {
      field: 'comment',
      headerName: 'Comments',
      type: 'string',      
      width: 360,
      editable: true,
      preProcessEditCellProps: (params: GridPreProcessEditCellProps) => {
        // Check if the row is selected only then check for empty comments field of the row
        if(rowSelectionModel.find((sRow) => sRow === params.id) == undefined) {
            const hasError = params.props.value.length == 0; // Empty comments check
            return { ...params.props, error: hasError };
          }   
      },      
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

  // TODO: Check if this method is required? Fetch embedded data from the case summary content
  const refreshTableData = useCallback(() => {      
    // Below method call directly reads from the embedded data page
    getDisbursementEmbeddedData(pConnectProp, embedDataPageProp).then(data => {                  
      setDisbursementTableData(data);
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
    }
  }, [pConnectProp, pageRef, embedDataPageProp, refreshTableData]);

  const handleOpenBulkUpdateClick = () => {
    const selectedRowsParam = getSelectedRows(rowSelectionModel, disbursementTableData);
    const unSelectedRowsParam = getUnSelectedRows(rowSelectionModel, disbursementTableData);
    create(ShowBulkUpdateModalDialog, { ...props, selectedRowsParam, unSelectedRowsParam, disbursementTableData, pageRef, updateComments, refreshTableData });
  }

  const updateSelectState = (selectedRowIds: any) => {
    console.log(selectedRowIds);
    if(selectedRowIds.length > 0) {
      // loop thru all the selectedRowIds to update the select value to true
      selectedRowIds.forEach((rowId) => { 
        const indexOfRow = disbursementTableData.findIndex(obj => obj.id === rowId);
        updateSelect(indexOfRow, true); 
      })
    } else {
      // loop thru entire disbursementTable table rows and update the select value to false
      disbursementTableData.forEach((row) => { 
        // update select state for the row id
        const indexOfRow = disbursementTableData.findIndex(obj => obj.id === row.id);
        updateSelect(indexOfRow, false); 
      })
    }    
    console.log("After state update=", disbursementTableData);
  }
 
  return (
    <StyledPegaExtensionsDBAuthoriseWrapper>
        <div style={{ height: 400, width: '100%', }}>
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
                  const activeSelectedRow = params.row;
                  const activeSelectedRowId = params.row.id;                      
                  const activeSelectedRowComment = event.target.value;
                  const indexOfRow = disbursementTableData.findIndex(obj => obj.id === activeSelectedRowId);
                  console.log(activeSelectedRow, activeSelectedRowId, activeSelectedRowComment, indexOfRow);
                  updateComments(indexOfRow, activeSelectedRowComment); // Update comments 
                }}   
                onRowSelectionModelChange={(newRowSelectionModel) => {
                  updateSelectState(newRowSelectionModel); // Update row select status
                  setRowSelectionModel(newRowSelectionModel);
                  console.log(rowSelectionModel);
                }}                            
                rowSelectionModel={rowSelectionModel}
              />
          </Box>                       
        </StyledBox>
        </div>
    </StyledPegaExtensionsDBAuthoriseWrapper>
   
  )
}