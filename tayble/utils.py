import pandas as pd
import os


def list_excel_files(directory="data"):
    return [f for f in os.listdir(directory) if "." in f]


def excel_to_html(path):
    xls = pd.ExcelFile(path)
    tables_list = {}

    for sheet_name in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet_name, header=None)
        html = df.to_html(table_id=f"myTable")
        tables_list[sheet_name] = html

    return tables_list


def excel_to_csv(path, coords, sheet_id):
    df = pd.read_excel(path, sheet_name=sheet_id, header=None)
    header_coords, data_coords, rows_to_rmv, cols_to_rmv = _process_coords(coords)

    df = df.drop(rows_to_rmv, axis=0)
    df = df.drop(cols_to_rmv, axis=1)

    for row in rows_to_rmv:
        if row < header_coords[2]:
            header_coords[2] -= 1
        if row < data_coords[0]:
            data_coords[0] -= 1
        if row < data_coords[2]:
            data_coords[2] -= 1

    for col in cols_to_rmv:
        if col < header_coords[3]:
            header_coords[3] -= 1
        if col < data_coords[1]:
            data_coords[1] -= 1
        if col < data_coords[3]:
            data_coords[3] -= 1

    header_df = df.iloc[
        header_coords[0] - 1 : header_coords[2], header_coords[1] - 1 : header_coords[3]
    ]
    headers = _combine_headers(header_df)

    data_df = df.iloc[
        data_coords[0] - 1 : data_coords[2], data_coords[1] - 1 : data_coords[3]
    ]
    data_df.columns = headers

    csv_path = _update_path(path, sheet_id)
    data_df.to_csv(csv_path, index=False)


def _update_path(path, sheet_id):
    root, _ = os.path.splitext(path)
    root = root.replace("data/", "data/csv/")
    new_path = f"{root}_{sheet_id}.csv"

    return new_path


def _process_coords(coords):
    rows_to_rmv = []
    cols_to_rmv = []

    for i, coord in enumerate(coords):
        if i == 0:
            header_coords = coord
        elif i == 1:
            data_coords = coord
        else:
            if coord[0] == coord[2]:
                rows_to_rmv.append(coord[0] - 1)
            else:
                cols_to_rmv.append(coord[1] - 1)

    return header_coords, data_coords, rows_to_rmv, cols_to_rmv


def _combine_headers(df: pd.DataFrame, separator: str = "_") -> list:
    combined_headers = []

    for col in range(df.shape[1]):
        column_headers = []
        for row in range(df.shape[0]):
            # Fill to the right: if the current cell is NaN, use the value from the left (if it's the first cell, skip)
            if pd.isna(df.iloc[row, col]) and col > 0:
                df.iloc[row, col] = df.iloc[row, col - 1]
            # Add the header to the column_headers list if it's not NaN
            if pd.notna(df.iloc[row, col]):
                column_headers.append(str(df.iloc[row, col]))

        # Combine the column headers with the separator and add to the combined_headers list
        combined_header = separator.join(column_headers)
        combined_headers.append(combined_header)

    return combined_headers
