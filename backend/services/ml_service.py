import os
import pandas as pd
from pycaret.classification import setup as cls_setup, compare_models as cls_compare
from pycaret.regression import setup as reg_setup, compare_models as reg_compare


def run_compare_models(csv_path: str, target_column: str, task_type: str = "classification") -> dict:
    """
    Takes a CSV path, a target column name, and the ML task type.
    Runs PyCaret's compare_models() and returns the best model info.

    Args:
        csv_path: Path to the CSV dataset.
        target_column: Name of the target/label column.
        task_type: Either 'classification' or 'regression'.

    Returns:
        A dict with the best model name and its metrics.
    """
    df = pd.read_csv(csv_path)

    if target_column not in df.columns:
        raise ValueError(f"Target column '{target_column}' not found. Available columns: {list(df.columns)}")

    if task_type == "classification":
        cls_setup(data=df, target=target_column, verbose=False, session_id=42)
        best_model = cls_compare(n_select=1)
    elif task_type == "regression":
        reg_setup(data=df, target=target_column, verbose=False, session_id=42)
        best_model = reg_compare(n_select=1)
    else:
        raise ValueError(f"Invalid task_type '{task_type}'. Use 'classification' or 'regression'.")

    model_name = type(best_model).__name__

    print(f"Best model: {model_name}")
    return {
        "status": "complete",
        "best_model": model_name,
        "task_type": task_type,
        "target_column": target_column,
    }
