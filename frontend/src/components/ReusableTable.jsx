import { MdEdit, MdDeleteForever, MdHistory } from "react-icons/md";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry,AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule])
export const COMMON_ACTIONS = {
  EDIT: {
    type: "edit",
    icon: <MdEdit />
  },
  DELETE: {
    type: "delete", 
    icon: <MdDeleteForever className="text-danger"/>
  },
  HISTORY:{
    type: "history",
    icon: <MdHistory />
  }
};

export const createRoleBasedActions = (role, allowedRoles = ["super_admin", "admin", "user"]) => {
  const showAction = allowedRoles.includes(role);
  
  return {
    edit: {
      ...COMMON_ACTIONS.EDIT,
      show: () => showAction
    },
    delete: {
      ...COMMON_ACTIONS.DELETE, 
      show: () => ["super_admin", "admin"].includes(role)
    },
    history:{
      ...COMMON_ACTIONS.HISTORY,
      show:()=> ["super_admin","admin","user"].includes(role)
    }
  };
};

export const createCustomRoleActions = (roleConfig) => {
  const actions = {};
  
  if (roleConfig.edit) {
    actions.edit = {
      ...COMMON_ACTIONS.EDIT,
      show: roleConfig.edit.show || (() => true)
    };
  }
  
  if (roleConfig.delete) {
    actions.delete = {
      ...COMMON_ACTIONS.DELETE,
      show: roleConfig.delete.show || (() => true)
    };
  }

  if (roleConfig.history){
    actions.history={
      ...COMMON_ACTIONS.HISTORY,
      show:roleConfig.history.show || (()=>true)
    }
  }
  
  return Object.values(actions);
};

const ReusableTable = ({
  data = [],
  columns = [],
  loading = false,
  searchable = false,
  searchTerm1 = "",
  searchTerm2 = "",
  searchTerm3="",
  onSearchChange1 = () => {},
  onSearchChange2 = () => {},
  onSearchChange3=()=>{},
  searchPlaceholder1= "Search by Name or Sku",
  searchPlaceholder2= "Search by Category",
  searchPlaceholder3="",
   showThirdSearch = false,
  actions = [],
  onActionClick = () => {},
    onResetSearch = () => {},
  emptyMessage = "No data found.",
  className = "",
  showHeader = true
}) => {

  const gridColumns = [
    ...columns.map(col => ({
      field: col.key,
      headerName: col.header,
      cellRenderer: col.render
        ? (params) => col.render(params.data)
        : undefined,
      width: col.width || 150,
      cellClass: col.cellClassName || "pt-1",
      headerClass: col.headerClassName || "bg-light fs-6 fw-bold" ,
    })),
  ];

  if (actions.length > 0) {
    gridColumns.push({
      cellClass:"pt-1",
      headerClass:"bg-light fs-6 fw-bold",
      headerName: "Actions",
      field: "actions",
      cellRenderer: (params) => {
        const availableActions = actions.filter(a => !a.show || a.show(params.data));
        if (availableActions.length === 0) return <span className="text-muted">-</span>;

        return (
          <div className="btn-group btn-group-sm">
            {availableActions.map((action, index) => (
              <button
                key={index}
                className={`btn btn-${action.variant } ${action.className || ""}`}
                onClick={() => onActionClick(action.type, params.data)}
                disabled={action.disabled && action.disabled(params.data)}
                title={action.title || action.type}
              >
                {action.icon && <span className="me-1">{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        );
      },
      minWidth: 150,
      flex: 1
    });
  }
  
  return (
    <div >
      
        {searchable && (
          <div className="mb-3 d-flex gap-3">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder={searchPlaceholder1}
                value={searchTerm1}
                onChange={(e) => onSearchChange1(e.target.value)}
              />
              <span className="input-group-text">
                <i className="fas fa-search"></i>
              </span>
            </div>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder={searchPlaceholder2}
                value={searchTerm2}
                onChange={(e) => onSearchChange2(e.target.value)}
              />
              <span className="input-group-text">
                <i className="fas fa-search"></i>
              </span>
            </div>
            {showThirdSearch && (
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder={searchPlaceholder3}
          value={searchTerm3}
          onChange={(e) => onSearchChange3(e.target.value)}
        />
        <span className="input-group-text">
          <i className="fas fa-search"></i>
        </span>
      </div>
    )}
              <div className="input-group">
             <button className="bg-danger text-white border-0 rounded pt-1 w-25" onClick={onResetSearch}>Reset</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center p-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
     
    <div className="ag-theme-alpine custom-ag-table" 
     style={{ width: "100%", maxWidth: "1200px",  
       borderRadius: "10px",
    overflow: "hidden", 
    border: "1px solid #ddd",
      }}>
      <AgGridReact 
  rowData={data}
  columnDefs={gridColumns}
  defaultColDef={{ resizable:true, sortable: true, filter: true }}
  domLayout="autoHeight"
  headerHeight={50}  
  rowHeight={40}     
  suppressCellFocus={true}
/>

    </div> )}
      
    </div>
  );
};

export default ReusableTable;



// import { MdEdit, MdDeleteForever } from "react-icons/md";
// export const COMMON_ACTIONS = {
//   EDIT: {
//     type: "edit",
//     icon: <MdEdit />
//   },
//   DELETE: {
//     type: "delete", 
//     icon: <MdDeleteForever className="text-danger"/>
//   },
// };

// export const createRoleBasedActions = (role, allowedRoles = ["super_admin", "admin", "user"]) => {
//   const showAction = allowedRoles.includes(role);
  
//   return {
//     edit: {
//       ...COMMON_ACTIONS.EDIT,
//       show: () => showAction
//     },
//     delete: {
//       ...COMMON_ACTIONS.DELETE, 
//       show: () => ["super_admin", "admin"].includes(role) // Only admin/super_admin can delete
//     },
//   };
// };

// // Helper function to create custom role-based actions
// export const createCustomRoleActions = (roleConfig) => {
//   const actions = {};
  
//   if (roleConfig.edit) {
//     actions.edit = {
//       ...COMMON_ACTIONS.EDIT,
//       show: roleConfig.edit.show || (() => true)
//     };
//   }
  
//   if (roleConfig.delete) {
//     actions.delete = {
//       ...COMMON_ACTIONS.DELETE,
//       show: roleConfig.delete.show || (() => true)
//     };
//   }
  
//   return Object.values(actions);
// };

// const ReusableTable = ({
//   data = [],
//   columns = [],
//   loading = false,
//   searchable = false,
//   searchTerm = "",
//   onSearchChange = () => {},
//   searchPlaceholder = "Search...",
//   actions = [],
//   onActionClick = () => {},
//   emptyMessage = "No data found.",
//   striped = true,
//   bordered = true,
//   hover = true,
//   responsive = true,
//   className = "",
//   headerClassName = "table-dark",
//   showHeader = true
// }) => {
  
//   // Function to check if any actions are available for a row
//   const hasAvailableActions = (row) => {
//     return actions.some(action => !action.show || action.show(row));
//   };

//   return (
//     <div className={`card shadow-sm ${className}`}>
//       <div className="card-body">
//         {/* Search Input */}
//         {searchable && (
//           <div className="mb-3">
//             <div className="input-group">
//               <input
//                 type="text"
//                 className="form-control"
//                 placeholder={searchPlaceholder}
//                 value={searchTerm}
//                 onChange={(e) => onSearchChange(e.target.value)}
//               />
//               <span className="input-group-text">
//                 <i className="fas fa-search"></i>
//               </span>
//             </div>
//           </div>
//         )}

//         {/* Table */}
//         {loading ? (
//           <div className="text-center p-4">
//             <div className="spinner-border" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         ) : (
//           <div className={responsive ? "table-responsive" : ""}>
//             <table className={`table ${striped ? 'table-striped' : ''} ${bordered ? 'table-bordered' : ''} ${hover ? 'table-hover' : ''}` }>
//               {showHeader && (
//                 <thead className={headerClassName}>
//                   <tr>
//                     {columns.map((column, index) => (
//                       <th 
//                         key={index} 
//                         style={column.headerStyle || {}}
//                         className={column.headerClassName || ""}
//                       >
//                         {column.header}
//                       </th>
//                     ))}
//                     {actions.length > 0 && <th>Actions</th>}
//                   </tr>
//                 </thead>
//               )}
//               <tbody>
//                 {data.length === 0 ? (
//                   <tr>
//                     <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center">
//                       {emptyMessage}
//                     </td>
//                   </tr>
//                 ) : (
//                   data.map((row, rowIndex) => {
//                     const availableActions = actions.filter(action => 
//                       !action.show || action.show(row)
//                     );
                    
//                     return (
//                       <tr key={rowIndex || row.id}>
//                         {columns.map((column, colIndex) => (
//                           <td 
//                             key={colIndex} 
//                             style={column.cellStyle || {}}
//                             className={column.cellClassName || ""}
//                           >
//                             {column.render ? column.render(row, rowIndex) : row[column.key]}
//                           </td>
//                         ))}
//                         {actions.length > 0 && (
//                           <td>
//                             {availableActions.length > 0 ? (
//                               <div className="btn-group btn-group-sm">
//                                 {availableActions.map((action, actionIndex) => (
//                                   <button
//                                     key={actionIndex}
//                                     className={`btn btn-${action.variant || 'outline-primary'} ${action.className || ''}`}
//                                     onClick={() => onActionClick(action.type, row)}
//                                     disabled={action.disabled && action.disabled(row)}
//                                     title={action.title || action.type}
//                                   >
//                                     {action.icon && <span className="me-1">{action.icon}</span>}
//                                     {action.label}
//                                   </button>
//                                 ))}
//                               </div>
//                             ) : (
//                               <span className="text-muted">-</span>
//                             )}
//                           </td>
//                         )}
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ReusableTable;