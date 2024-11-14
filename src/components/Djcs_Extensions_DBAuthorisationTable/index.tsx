import { Text, Grid, FieldGroup, withConfiguration } from '@pega/cosmos-react-core';

import type { PConnFieldProps } from './PConnProps';

import StyledDjcsExtensionsDbAuthorisationTableWrapper from './styles';
import PreDisbursementAuthorise from './PreDisbursementAuthorise';


// interface for props
interface DjcsExtensionsDbAuthorisationTableProps extends PConnFieldProps {
  // If any, enter additional props that only exist on TextInput here
  showLabel: boolean;
  NumCols: string;  
  children: any;   
  heading: string;
  embedDataPage: string;
  paginationSize: string;
}

// props passed in combination of props from property panel (config.json) and run time props from Constellation
// any default values in config.pros should be set in defaultProps at bottom of this file
function DjcsExtensionsDbAuthorisationTable(props: DjcsExtensionsDbAuthorisationTableProps) {
  // children is hidden from the render, so had to use no-unused-prop-types warning
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { NumCols = '1', label, showLabel, getPConnect, heading, children, embedDataPage, paginationSize } = props;
  /* eslint-enable @typescript-eslint/no-unused-vars */
  const propsToUse = { label, showLabel, ...getPConnect().getInheritedProps() };
  const nCols = parseInt(NumCols, 10);

  return (
    <StyledDjcsExtensionsDbAuthorisationTableWrapper>
    
      <FieldGroup name={propsToUse.showLabel ? propsToUse.label : ''}>
        <Grid container={{
            cols: `repeat(${nCols}, minmax(0, 1fr))`,
            gap: 2
          }}>
            {/* I'm hiding the children display here so that embedded data model still in the case view but not visible in the web page */}
            {/* {children} */}
        </Grid>
        <br/>
        <Text variant='h2' status={undefined}>
          {heading}
        </Text>        
        <PreDisbursementAuthorise embedDataPageProp={embedDataPage} pConnectProp={getPConnect} paginationSizeProp={paginationSize}/>
      </FieldGroup>
    
    </StyledDjcsExtensionsDbAuthorisationTableWrapper>
  );


}

export default withConfiguration(DjcsExtensionsDbAuthorisationTable);
