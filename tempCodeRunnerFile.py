    cat_columns = ['Weather', 'Description', 'Day', 'Hour']
    input_df = pd.get_dummies(input_df, columns=cat_columns)