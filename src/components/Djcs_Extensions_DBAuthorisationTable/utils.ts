import { randomId } from '@mui/x-data-grid-generator';

/* Function to retrieve dataPage list */
export const getDataPageResults = async (pConn: any, paramDataPage: any) => {
    const PCore = (window as any).PCore;    
    const context = pConn().getContextName();
    const dataPage = paramDataPage?.referenceList;    
    const parameters = paramDataPage?.parameters?paramDataPage.parameters:{};

    try {
        const getData = await PCore.getDataPageUtils().getDataAsync(dataPage, context, parameters);
        if (getData.status === 200 || getData.data.length > 0) {
            return getData.data;
        }
    }
    catch (error) {
        console.log(error);
    }
}

/* 
   Function getDisbursementEmbeddedData used to retrieve data from the embedded data model that is 
    configured in the case level view authoring UI. 
    This function uses pConnect API to retrieve the data from embedded data model
    Parameters used are pConnect object and embedded data model from the config
    Sample returned embedded data 
    {
        "classID": "DJCS-Data-ObligationStore-DisbursementHeaders",
        "comment": "",
        "disbursement_type": "Enforcement agencies",
        "payee_name": "BANYULE CITY COUNCIL",
        "disbursement_id": "",
        "Status": "Unauthorised-Cleared",
        "Type": "Regular",
        "amount": -213.3,
        "DebtorID": "",
        "identifier": "",
        "pyGUID": "",
        "Select": false
    }
*/
export const getDisbursementEmbeddedData = async (paramPConn: any, paramEmbedName: string ) => {
    try {
        // Get case summary object from the pConnect object
        const caseSummaryObj = paramPConn().getCaseSummary();
        // Get case summary content object 
        const caseSummaryContentObj = caseSummaryObj.content;    
        console.log(caseSummaryContentObj);   

/*      Call pConnect getValue method and pass embedded data model with dot notation to retrieve the 
        list of data.
        e.g. to get DisbursementList embedded data object values -> pConn().getValue(".DisbursementList")         */
        const arrayOfEmbeddedList = paramPConn().getValue(`.${paramEmbedName}`);

        // Loop thru the array and store the data in local array as return object for this function
        const rowArray: any = [];        
        arrayOfEmbeddedList?.map((listitem: any) => ( 
            rowArray.push({                                
                id: listitem['pyGUID'],  // reference is Disbursement Id, used a unique ID for each rows
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
            })
            )
        );        
        return(rowArray);
    }
    catch (error) {
        console.log(error);
    }
}

// Function to check if the value is empty
export const isEmpty = (value: any) => {
    return (value == null || (typeof value === "string" && value.trim().length === 0));
  }

// Function to retrieve selected rows 
export const getSelectedRows = (rowSelectionModel: any, disbursementTableData: any) => {
    const selectedRowsData = rowSelectionModel.map((id:string) => disbursementTableData.find((row:any) => row.id === id));
    return (selectedRowsData);
}

// Function to retrieve unselected rows 
export const getUnSelectedRows = (rowSelectionModel: any, disbursementTableData: any) => {
    const excludeList = new Set(rowSelectionModel);
    const unSelectedRowsData = disbursementTableData.filter((e:any) => !excludeList.has(e.id));  
    return (unSelectedRowsData);
}

/* Function to lookup select state TRUE to return list of pre-selected rows ids ONLY */
export const getPreSelectedTableDataListIds = (disbursementTableData: any) => {        
    const preSelectedRowsIds = disbursementTableData.filter((row: any) => row.select === true).map((row: any) => row.id);
    return (preSelectedRowsIds);
}

/* Function to lookup select state TRUE to return list of pre-selected rows */
export const getPreSelectedTableDataList = (disbursementTableData: any) => {        
    const preSelectedRows = disbursementTableData.filter((row: any) => row.select === true).map((row: any) => row);
    return (preSelectedRows);
}

/* Function to read result returned from embedded disbursement list and put them in a array for Table component to render */
/* sample array returned by the raw embedded data format 
{
    "transaction_date": null,
    "batch_id": null,
    "difference_in_days": null,
    "disbursement_id": null,
    "mdm_golden_id": null,
    "registration_fee": 30,
    "issuing_agency_code": null,
    "warrant_cost": null,
    "prn_amount": 40,
    "obligation_number": "3232323232",
    "pxObjClass": "DJCS-Data-ObligationStore-DisbursementDetails",
    "actual_payment_date": null,
    "total_paid": 100,
    "infringement_number": "3232323232",
    "court_cost_amount": null,
    "enforcement_fee": 60,
    "fine_amount": 20,
    "disbursement_type": null,
    "infringement_issue_date": null,
    "collection_statement_issue_date": null
} */
export const getDisbursementDetailsDataAsRowData = (dataPageResults: []) => {
    const rowArray: any = [];        
    dataPageResults?.map((listitem: any) => ( 
        rowArray.push({
            id: (randomId()), // unique row id
            disbursementId: listitem['disbursement_id'],
            enforcementFee: listitem['enforcement_fee'],
            fineAmount: listitem['fine_amount'],
            infringementNumber: listitem['infringement_number'],
            obligationNumber: listitem['obligation_number'],
            prnAmount: listitem['prn_amount'],
            registrationFee: listitem['registration_fee'],
            totalPaid: listitem['total_paid'],                
        })
    ))    
    return rowArray;
}

