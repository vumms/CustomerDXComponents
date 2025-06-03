// individual style, comment out above, and uncomment here and add styles
import styled, { css } from 'styled-components';

export default styled.div(() => {
  return css`
    margin: 0px 0;
  `;
});

const styleRoot = {
  border: '1px solid #cfcfcf'
};

export const StyledTable = styled.table(() => {
  return css`
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
    border: ${styleRoot.border};
    margin-top: 10px;
    margin-bottom: 10px;
  `;
});

export const StyledBox = styled('div')(() => ({
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
    color: '#d32f2f',      
  },    
}));


export const StyledWrapper = styled.div(() => {
  return css`
      height: 400;
      width: '100%';
      margin-bottom: 16px;
  `;
});

/* export const StyledBox = styled('div')(({ theme }) => ({
  height: 300,
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
})); */