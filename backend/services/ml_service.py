import pandas as pd
from pycaret.classification import setup as cls_setup, compare_models as cls_compare, pull as cls_pull
from pycaret.regression import setup as reg_setup, compare_models as reg_compare, pull as reg_pull
from services.job_tracker import complete_job, fail_job


def run_compare_models(job_id: str, csv_path: str, target_column: str, task_type: str = "classification") -> None:
    """
    Takes a job ID, CSV path, target column name, and ML task type.
    Runs PyCaret's compare_models() and updates the job tracker with results.
    """
    try:
        df = pd.read_csv(csv_path)

        if target_column not in df.columns:
            raise ValueError(f"Target column '{target_column}' not found. Available: {list(df.columns)}")

        if task_type == "classification":
            cls_setup(data=df, target=target_column, verbose=False, session_id=42)
            best_model = cls_compare(n_select=1)
            leaderboard = cls_pull()
        elif task_type == "regression":
            reg_setup(data=df, target=target_column, verbose=False, session_id=42)
            best_model = reg_compare(n_select=1)
            leaderboard = reg_pull()
        else:
            raise ValueError(f"Invalid task_type '{task_type}'. Use 'classification' or 'regression'.")

        model_name = type(best_model).__name__

        # Convert the leaderboard DataFrame to a list of dicts for JSON
        leaderboard_data = leaderboard.reset_index().rename(columns={"index": "Model"}).to_dict(orient="records")

        print(f"Best model: {model_name}")
        complete_job(job_id, {
            "best_model": model_name,
            "task_type": task_type,
            "target_column": target_column,
            "leaderboard": leaderboard_data,
        })
    except Exception as e:
        print(f"ML training failed: {e}")
        fail_job(job_id, str(e))
