import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from io import BytesIO

# 1. Page Configuration
st.set_page_config(page_title="Prerak Estimator", layout="wide")

# 2. Session State Setup (For temporary Admin changes)
if 'rates' not in st.session_state:
    st.session_state.rates = {
        "Brickwork (m3)": 12000,
        "RCC M20 (m3)": 15000,
        "Plaster (sq.m)": 800,
        "Gypsum Ceiling (sq.ft)": 120,
        "Wall Paint (sq.ft)": 40,
        "UPVC Window (sq.ft)": 850
    }
if 'company_info' not in st.session_state:
    st.session_state.company_info = {
        "name": "Prerak Multipurpose Company Pvt. Ltd.",
        "address": "Kantirajpath, Hetauda",
        "tagline": "Sewa Nepalbhar"
    }
if 'project_image' not in st.session_state:
    st.session_state.project_image = None

# 3. Sidebar Navigation
st.sidebar.title("App Navigation")
page = st.sidebar.radio("Menu:", ["Estimator Tool", "Admin Panel"])

# ==========================================
# ADMIN PANEL SECTION
# ==========================================
if page == "Admin Panel":
    st.title("🔒 Admin Panel")
    # Password set to 'prerak123'
    password = st.text_input("Enter Password", type="password")
    
    if password == "prerak123":
        st.success("Admin Login Successful!")
        
        st.header("1. Company Details Setup")
        st.session_state.company_info['name'] = st.text_input("Company Name", st.session_state.company_info['name'])
        st.session_state.company_info['address'] = st.text_input("Headquarters Location", st.session_state.company_info['address'])
        st.session_state.company_info['tagline'] = st.text_input("Service Scope", st.session_state.company_info['tagline'])
        
        st.header("2. Update Material Rates (Market Price)")
        col1, col2 = st.columns(2)
        with col1:
            st.subheader("Construction Items")
            st.session_state.rates["Brickwork (m3)"] = st.number_input("Brickwork (m3)", value=st.session_state.rates["Brickwork (m3)"])
            st.session_state.rates["RCC M20 (m3)"] = st.number_input("RCC M20 (m3)", value=st.session_state.rates["RCC M20 (m3)"])
            st.session_state.rates["Plaster (sq.m)"] = st.number_input("Plaster (sq.m)", value=st.session_state.rates["Plaster (sq.m)"])
        with col2:
            st.subheader("Interior Items")
            st.session_state.rates["Gypsum Ceiling (sq.ft)"] = st.number_input("Gypsum Ceiling (sq.ft)", value=st.session_state.rates["Gypsum Ceiling (sq.ft)"])
            st.session_state.rates["Wall Paint (sq.ft)"] = st.number_input("Wall Paint (sq.ft)", value=st.session_state.rates["Wall Paint (sq.ft)"])
            st.session_state.rates["UPVC Window (sq.ft)"] = st.number_input("UPVC Window (sq.ft)", value=st.session_state.rates["UPVC Window (sq.ft)"])
        
        st.header("3. Upload Real Project Photo")
        uploaded_file = st.file_uploader("Upload an image (Will show on Estimator)", type=["jpg", "png", "jpeg"])
        if uploaded_file is not None:
            st.session_state.project_image = uploaded_file
            st.success("Project Image saved!")
            
    elif password != "":
        st.error("Incorrect Password. Please try again.")

# ==========================================
# ESTIMATOR TOOL SECTION
# ==========================================
elif page == "Estimator Tool":
    st.markdown(f"<h1 style='text-align: center; color: #1E3A8A;'>{st.session_state.company_info['name']}</h1>", unsafe_allow_html=True)
    st.markdown(f"<h4 style='text-align: center;'>{st.session_state.company_info['address']} | {st.session_state.company_info['tagline']}</h4>", unsafe_allow_html=True)
    st.divider()

    if st.session_state.project_image is not None:
        st.image(st.session_state.project_image, caption="Our Recent Work", use_column_width=True)

    st.sidebar.header("Measurement Inputs")
    mode = st.sidebar.radio("Select Project Type:", ["Building Construction", "Interior Design"])
    
    L = st.sidebar.slider("Length (ft/m)", 1, 100, 15)
    B = st.sidebar.slider("Breadth (ft/m)", 1, 100, 12)
    H = st.sidebar.slider("Height (ft/m)", 1, 50, 10)
    margin = st.sidebar.slider("Profit Margin (%)", 0, 30, 10)

    volume = L * B * H
    floor_area = L * B
    wall_area = 2 * (L + B) * H
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("Live 3D View")
        fig = go.Figure(data=[
            go.Mesh3d(
                x=[0, 0, L, L, 0, 0, L, L],
                y=[0, B, B, 0, 0, B, B, 0],
                z=[0, 0, 0, 0, H, H, H, H],
                i=[7, 0, 0, 0, 4, 4, 6, 6, 4, 0, 3, 2],
                j=[3, 4, 1, 2, 5, 6, 5, 2, 0, 1, 6, 3],
                k=[0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 6],
                opacity=0.3, color='#1E3A8A'
            )
        ])
        fig.update_layout(scene=dict(aspectmode='data'))
        st.plotly_chart(fig, use_container_width=True)

    with col2:
        st.subheader("Bill of Quantities (BoQ)")
        data = []
        if mode == "Building Construction":
            data.append(["Brickwork", volume, "m3", st.session_state.rates["Brickwork (m3)"]])
            data.append(["RCC M20", volume * 0.3, "m3", st.session_state.rates["RCC M20 (m3)"]])
            data.append(["Plaster", wall_area, "sq.m", st.session_state.rates["Plaster (sq.m)"]])
        else:
            data.append(["Gypsum Ceiling", floor_area, "sq.ft", st.session_state.rates["Gypsum Ceiling (sq.ft)"]])
            data.append(["Wall Paint", wall_area, "sq.ft", st.session_state.rates["Wall Paint (sq.ft)"]])
            data.append(["UPVC Window", floor_area * 0.15, "sq.ft", st.session_state.rates["UPVC Window (sq.ft)"]])
            
        df = pd.DataFrame(data, columns=["Item Description", "Quantity", "Unit", "Rate"])
        df["Total Amount"] = df["Quantity"] * df["Rate"]
        
        st.dataframe(df)
        
        subtotal = df["Total Amount"].sum()
        profit = subtotal * (margin / 100)
        grand_total = subtotal + profit
        
        st.write(f"**Subtotal:** Rs. {subtotal:,.2f}")
        st.write(f"**Margin ({margin}%):** Rs. {profit:,.2f}")
        st.markdown(f"### **Grand Total: Rs. {grand_total:,.2f}**")
        
        def to_excel(df_export):
            output = BytesIO()
            writer = pd.ExcelWriter(output, engine='openpyxl')
            df_export.to_excel(writer, index=False, sheet_name='BoQ Estimate')
            writer.close()
            return output.getvalue()
            
        df_export = df.copy()
        df_export.loc[len(df_export)] = ["Profit Margin", "", "%", margin, profit]
        df_export.loc[len(df_export)] = ["GRAND TOTAL", "", "", "", grand_total]

        excel_data = to_excel(df_export)
        st.download_button(label="📥 Download BoQ (Excel)",
                           data=excel_data,
                           file_name='Cost_Estimate.xlsx',
                           mime='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
