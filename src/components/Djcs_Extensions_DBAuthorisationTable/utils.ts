import { randomId } from '@mui/x-data-grid-generator';

/* Function to retrieve dataPage list */
export const getDataPageResults = async (pConn: any, paramDataPage: string ) => {
    const PCore = (window as any).PCore;    
    const context = pConn().getContextName();

    try {
        const getData = await PCore.getDataPageUtils().getDataAsync(paramDataPage, context);
        if (getData.status === 200 || getData.data.length > 0) {
            return getData.data;
        }
    }
    catch (error) {
        console.log(error);
    }
}

/* Function to lookup embedded data for Disbursement Object and retrieve list objects in an array */
export const getDisbursementEmbeddedData = async (paramPConn: any, paramEmbedName: string ) => {

    try {
        const caseSummaryObj = paramPConn().getCaseSummary();
        const caseSummaryContentObj = caseSummaryObj.content;    
        console.log(caseSummaryContentObj);   
        /* const embedDataPageList =  `${caseSummaryObj.content}.${paramEmbedName}`;
        console.log(embedDataPageList);   */
        // e.g. to get DisbursementList object values -> pConn().getValue(".DJCSEmbeddedPage")
        const arrayOfEmbeddedList = paramPConn().getValue(`.${paramEmbedName}`);
        // const cPageReference = `${pConnectProp().getPageReference()}.${disbursementObject}`;
        const rowArray: any = [];        
        arrayOfEmbeddedList?.map((listitem: any) => ( 
            rowArray.push({                                
                id: (listitem['pyGUID']?listitem['pyGUID']:randomId()),
                batchId: listitem['batch_id'],
                beneficiary_type: listitem['disbursement_type'],
                beneficiary_name: listitem['payee_name'],
                reference: listitem['reference'],
                debtor_id: listitem['mdm_golden_id'],
                type: listitem['Type'],
                amount: listitem['amount'],
                identifier: listitem['identifier'],                
                sts: listitem['Status'],
                comment: listitem['comment'],    
                select: listitem['Select'],  // boolean select state of each row 
                detailsData: [
                    { id: randomId(), item: 'detailsField1', amt: '100' },
                    { id: randomId(), item: 'detailsField2', amt: '100' },
                    { id: randomId(), item: 'detailsField3', amt: '100' },
                    { id: randomId(), item: 'detailsField4', amt: '100' },
                    { id: randomId(), item: 'detailsField5', amt: '100' },
                ],
            })
            )
        );
        console.log(rowArray);     
        return(rowArray);
    }
    catch (error) {
        console.log(error);
    }
}

export const getSelectedRows = (rowSelectionModel: any, disbursementTableData: any) => {
    const selectedRowsData = rowSelectionModel.map((id:string) => disbursementTableData.find((row:any) => row.id === id));
    return (selectedRowsData);
}

export const getUnSelectedRows = (rowSelectionModel: any, disbursementTableData: any) => {
    const excludeList = new Set(rowSelectionModel);
    const unSelectedRowsData = disbursementTableData.filter((e:any) => !excludeList.has(e.id));  
    return (unSelectedRowsData);
}

/* Function to read disbursement datapage results and put them in a row array for Table component to render */
/* sample array format {id: 1, bty: 'Debtor refunds', bnam: 'Virgel', bid: '9988768789', amt: 100.00,
type: 'Irregular', did: '2345',bsts: 'Fixed-Reissue',  isAccepted: true, comments: '', */
/* export const formatEmbeddedDataResultsToTableRowData = (dataPageResults: []) => {
    const rowArray: any = [];
    dataPageResults.map(arrayData => (   
        rowArray.push({                     
            id: arrayData['pyGUID'], // Unique-id is mandatory for Table rows
            b_type: arrayData['disbursement_type'],
            b_name: arrayData['payee_name'],
            b_id: arrayData['mdm_golden_id'],
            amount: arrayData['amount'],
            type: arrayData['Type'],
            debtor_id: arrayData['reference'],
            status: arrayData['Status'],
            comments: arrayData['Comments'],
            detailsData: [
                { id: randomId(), item: 'detailsField1', amt: '100' },
                { id: randomId(), item: 'detailsField2', amt: '100' },
                { id: randomId(), item: 'detailsField3', amt: '100' },
                { id: randomId(), item: 'detailsField4', amt: '100' },
                { id: randomId(), item: 'detailsField5', amt: '100' },
            ],
        })
    ))
    console.log(rowArray); 
    return rowArray;
} */

/* Function to read disbursement dataPage results and put them in a row array for Table component to render */
/* sample array format {
Comments:null
Status:"Fixed- Reissue"
Type: "Irregular"
amount:290
batch_id:4134
disbursement_type:"Debtor refunds"
identifier:null
mdm_golden_id:"9780034"
payee_name:"  Virgel"
pxObjClass:"DJCS-Data-ObligationStore-DisbursementHeaders"
reference:"3364"} */
export const formatDataPageResultsToTableRowData = (dataPageResults: []) => {
    const rowArray: any = [];
    dataPageResults.map(arrayData => (   
        rowArray.push({                     
            id: randomId(),
            b_type: arrayData['disbursement_type'],
            b_name: arrayData['payee_name'],
            b_id: arrayData['mdm_golden_id'],
            amount: arrayData['amount'],
            type: arrayData['Type'],
            debtor_id: arrayData['reference'],
            status: arrayData['Status'],
            comments: arrayData['Comments'],
            isAccepted: true, // This is added custom extra column, need to review this column later 
        })
    ))
    console.log(rowArray); 
    return rowArray;
}
