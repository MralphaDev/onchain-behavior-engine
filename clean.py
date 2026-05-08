import pandas as pd

input_file = "input.csv"
output_file = "filtered_output.csv"

df = pd.read_csv(input_file)

# --- clean supply_percentage ---
def parse_value(x):
    if pd.isna(x):
        return None
    if isinstance(x, str):
        x = x.strip().replace('%', '')
    try:
        return float(x)
    except:
        return None

df["supply_percentage_clean"] = df["supply_percentage"].apply(parse_value)

# --- clean is_contract ---
def parse_bool(x):
    if isinstance(x, str):
        return x.strip().lower() == "true"
    return bool(x)

df["is_contract_clean"] = df["is_contract"].apply(parse_bool)

# --- apply filters ---
filtered_df = df[
    (df["supply_percentage_clean"] > 0.001) &
    (df["is_contract_clean"] == False)
].copy()

# cleanup helper columns
filtered_df.drop(columns=["supply_percentage_clean", "is_contract_clean"], inplace=True)

# save result
filtered_df.to_csv(output_file, index=False)

print(f"Filtered file saved to: {output_file}")