import { MdEdit, MdDeleteForever, MdHistory } from "react-icons/md";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);
import { RiResetLeftLine } from "react-icons/ri";
export const COMMON_ACTIONS = {
  EDIT: {
    type: "edit",
    icon: <MdEdit />,
  },
  DELETE: {
    type: "delete",
    icon: <MdDeleteForever className="text-danger" />,
  },
  HISTORY: {
    type: "history",
    icon: <MdHistory />,
  },
};

const ReusableTable = ({
  data = [],
  columns = [],
  actions = [],
  onActionClick = () => {},
  loading = false,

  searchable = false,

  searchTerm1 = "",
  searchTerm2 = "",
  searchTerm3 = "",
  searchTerm4 = "",

  onSearchChange1 = () => {},
  onSearchChange2 = () => {},
  onSearchChange3 = () => {},
  onSearchChange4 = () => {},

  searchPlaceholder1 = "Search...",
  searchPlaceholder2 = "Search...",
  searchPlaceholder3 = "Search...",
  searchPlaceholder4 = "Search...",
  showThirdSearch = false,
  onResetSearch = () => {},
  fromDate = "",
toDate = "",
onFromDateChange = () => {},
onToDateChange = () => {},
}) => {

  const gridColumns = [];

  if (actions.length > 0) {
    gridColumns.push({
      headerName: "Actions",
      field: "actions",
      pinned: "left",
      width: 140,
      cellRenderer: (params) => {
        const availableActions = actions.filter(
          (a) => !a.show || a.show(params.data)
        );

        return (
          <div className="d-flex gap-1">
            {availableActions.map((action, i) => (
              <button
                key={i}
                className="btn btn-sm "
                onClick={() => onActionClick(action.type, params.data)}
              >
                {action.icon}
              </button>
            ))}
          </div>
        );
      },
    });
  }

  gridColumns.push(
    ...columns.map((col) => ({
      headerName: col.header,
      field: col.key,
      flex: col.flex || 1,
      width: col.width,
      cellRenderer: col.render
        ? (params) => col.render(params.data)
        : undefined,
    }))
  );

  return (
    <div>
{searchable && (
  <div className="row mb-3 g-2 align-items-center">

    <div className="col-md">
      <input
        className="form-control"
        placeholder={searchPlaceholder1}
        value={searchTerm1}
        onChange={(e) => onSearchChange1(e.target.value)}
      />
    </div>

    <div className="col-md">
      <input
        className="form-control"
        placeholder={searchPlaceholder2}
        value={searchTerm2}
        onChange={(e) => onSearchChange2(e.target.value)}
      />
    </div>

    {showThirdSearch && (
      <div className="col-md">
        <input
          className="form-control"
          placeholder={searchPlaceholder3}
          value={searchTerm3}
          onChange={(e) => onSearchChange3(e.target.value)}
        />
      </div>
    )}

    <div className="col-md">
      <input
        type="date"
        className="form-control"
        value={fromDate}
        onChange={(e) => onFromDateChange(e.target.value)}
      />
    </div>

    <div className="col-md">
      <input
        type="date"
        className="form-control"
        value={toDate}
        onChange={(e) => onToDateChange(e.target.value)}
      />
    </div>

    <div className="col-auto">
      <button className="btn text-danger" onClick={onResetSearch}>
        <RiResetLeftLine />
      </button>
    </div>

  </div>
)}
      {loading ? (
        <div className="text-center p-4">
          <div className="spinner-border"></div>
        </div>
      ) : (
        <div
          className="ag-theme-alpine"
          style={{
            width: "100%",
            borderRadius: "10px",
            overflow: "hidden",
            border: "1px solid #ddd",
          }}
        >
          <AgGridReact
            rowData={data}
            columnDefs={gridColumns}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
            }}
            pagination={true}
  paginationPageSize={10}
  paginationPageSizeSelector={[10, 20, 50, 100]}
            domLayout="autoHeight"
            rowHeight={45}
          />
        </div>
      )}
    </div>
  );
};

export default ReusableTable;