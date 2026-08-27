import styles from "./DataTable.module.css";
import {
  CompressOutlined,
  DownloadOutlined,
  ExpandOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Input, Menu, Table } from "antd";
import { useEffect, useRef, useState } from "react";
import HeaderTitle from "../HeaderTitle/HeaderTitle";

const DataTable = ({
  title,
  columns,
  dataSource,
  loading = false,

  searchPlaceholder,
  onSearch,
  showSearch = false,

  showRowSelection = false,
  rowSelection,

  showFilter = false,
  filterContent,
  filterOptions,
  onFilter,

  onExport,
  showExport = false,

  showAddBtn = false,
  onAdd,

  showBtn = false,
  onSubmitBtn,
  btnText = "",

  showFullScreen = false,

  pagination,
  showPagination = false,

  tableHeight,
  rowKey = "id",
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const scrollPosition = useRef(0);

  useEffect(() => {
    if (scrollPosition.current > 0) {
      window.scrollTo(0, scrollPosition.current);
    }
  }, [dataSource]);

  const handlePageChange = (newPage, newSize) => {
    scrollPosition.current = window.scrollY;
    if (newSize !== pagination.size) {
      pagination.setPage(0);
      pagination.setSize(newSize);
      return;
    }
    pagination.setPage(newPage - 1);
  };

  const tablePagination =
    showPagination && pagination
      ? {
          current: pagination.page + 1,
          pageSize: pagination.size,
          total: pagination.total,
          showTotal: (total, range) =>
            `${range[0]} - ${range[1]} of ${total} items`,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          showLessItems: true,
          onChange: handlePageChange,
        }
      : false;
  const showToolbar =
    showSearch ||
    showFilter ||
    showAddBtn ||
    showExport ||
    showFullScreen ||
    title;

  const getValue = (record, dataIndex) => {
    if (!record || !dataIndex) return undefined;

    if (Array.isArray(dataIndex)) {
      return dataIndex.reduce((value, key) => value?.[key], record);
    }
    return record[dataIndex];
  };

  const formattedColumns = columns.map((column) => {
    const values = dataSource?.map((record) =>
      getValue(record, column.dataIndex),
    );
    const hasString = values?.some((value) => typeof value === "string");
    return {
      ...column,
      title: <HeaderTitle title={column.title} />,
      align: column.align || (hasString ? "left" : "center"),
    };
  });

  return (
    <div
      className={`${styles.container} ${isFullScreen ? styles.fullscreen : ""}`}
      style={{ "--table-min-height": `${tableHeight}px` }}
    >
      {showToolbar && (
        <div className={styles.toolbar}>
          {showFullScreen && (
            <Button
              className={styles.fullscreenBtn}
              type="text"
              icon={isFullScreen ? <CompressOutlined /> : <ExpandOutlined />}
              onClick={() => setIsFullScreen((prev) => !prev)}
            ></Button>
          )}
          {showSearch && (
            <Input
              className={styles.search}
              prefix={<SearchOutlined />}
              placeholder={searchPlaceholder}
              allowClear
              onChange={(e) => onSearch?.(e.target.value)}
            />
          )}
          {title && <div className={styles.tableTitle}>{title}</div>}
          <div className={styles.actions}>
            {showAddBtn && (
              <Button type="primary" icon={<PlusOutlined />} onClick={onAdd} />
            )}
            {showBtn && (
              <Button type="primary" onClick={onSubmitBtn}>
                {btnText}
              </Button>
            )}
            {showFilter && (
              <Dropdown
                popupRender={() => (
                  <div className={styles.filterMenu}>
                    {filterContent
                      ? filterContent
                      : filterOptions && (
                          <Menu
                            items={filterOptions}
                            onClick={({ key }) => onFilter?.(key)}
                          />
                        )}
                  </div>
                )}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button icon={<FilterOutlined />} />
              </Dropdown>
            )}
            {showExport && (
              <Button icon={<DownloadOutlined />} onClick={onExport}></Button>
            )}
          </div>
        </div>
      )}

      <Table
        columns={formattedColumns}
        dataSource={dataSource}
        loading={loading}
        rowKey={rowKey}
        rowSelection={showRowSelection ? rowSelection : undefined}
        pagination={tablePagination}
        scroll={{
          x: "max-content",
          y: isFullScreen ? "calc(100vh - 150px)" : tableHeight,
        }}
      />
    </div>
  );
};

export default DataTable;
