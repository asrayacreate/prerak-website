import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from io import BytesIO

# 1. Page Configuration
st.set_page_config(page_title="Prerak Estimator Admin", layout="wide")

# 2. Session State Setup
# 2. Session State Setup (Yo bhag lai matra update garnuhos)
if 'company_info' not in st.session_state:
    st.session_state.company_info = {
        "name": "Prerak Multipurpose Company Pvt. Ltd.",
        "address": "Kantirajpath, Hetauda",
        "phone": "+977-98XXXXXXXX",
        "established": "2020",
        "description": "Prerak Multipurpose provides best construction and interior services in Nepal.",
        "tagline": "Sewa Nepalbhar"
    }

if 'rates' not in st.session_state:
    st.session_state.rates = {
        "Brickwork (m3)": 12000,
        "AAC Block (m3)": 10500,
        "RCC M20 (m3)": 15000,
        "Plaster (sq.m)": 800,
        "Gypsum Ceiling (sq.ft)": 120,
        "Wall Putty (sq.ft)": 25,
        "Wall Paint (sq.ft)": 40,
        "Floor Tiles (sq.ft)": 110,
        "UPVC Window (sq.ft)": 850,
        "Aluminum Partition (sq.ft)": 450
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
    st.title("🔒 Advanced Admin Control")
    password = st.text_input("Enter Password", type="password")
    
    if password == "prerak123":
        st.success("Admin Login Successful!")
        
        st.header("1. Complete Business Details")
        col_a, col_b = st.columns(2)
        with col_a:
            st.session_state.company_info['name'] = st.text_input("Company Name", st.session_state.company_info['name'])
            st.session_state.company_info['address'] = st.text_input("Location", st.session_state.company_info['address'])
            st.session_state.company_info['phone'] = st.text_input("Contact Phone", st.session_state.company_info['phone'])
        with col_b:
            st.session_state.company_info['established'] = st.text_input("Established Since", st.session_state.company_info['established'])
            st.session_state.company_info['tagline'] = st.text_input("Slogan/Tagline", st.session_state.company_info['tagline'])
        
        st.session_state.company_info['description'] = st.text_area("Company Description / About Us", st.session_state.company_info['description'])
        
        st.header("2. Update Material Rates")
        c1, c2 = st.columns(2)
        with c1:
            st.session_state.rates["Brickwork (m3)"] = st.number_input("Brickwork (m3)", value=st.session_state.rates["Brickwork (m3)"])
            st.session_state.rates["RCC M20 (m3)"] = st.number_input("RCC M20 (m3)", value=st.session_state.rates["RCC M20 (m3)"])
        with c2:
            st.session_state.rates["Gypsum Ceiling (sq.ft)"] = st.number_input("Gypsum Ceiling (sq.ft)", value=st.session_state.rates["Gypsum Ceiling (sq.ft)"])
            st.session_state.rates["UPVC Window (sq.ft)"] = st.number_input("UPVC Window (sq.ft)", value=st.session_state.rates["UPVC Window (sq.ft)"])
        
        st.header("3. Main Website Photo")
        uploaded_file = st.file_uploader("Upload Company/Project Photo", type=["jpg", "png", "jpeg"])
        if uploaded_file is not None:
            st.session_state.project_image = uploaded_file
            st.success("New Photo Uploaded!")
            
    elif password != "":
        st.error("Access Denied.")

# ==========================================
# ESTIMATOR TOOL
# ==========================================
else:
    st.markdown(f"<h1 style='text-align: center; color: #1E3A8A;'>{st.session_state.company_info['name']}</h1>", unsafe_allow_html=True)
    st.markdown(f"<p style='text-align: center;'><b>{st.session_state.company_info['address']}</b> | Estd: {st.session_state.company_info['established']}</p>", unsafe_allow_html=True)
    st.markdown(f"<p style='text-align: center;'>📞 {st.session_state.company_info['phone']} | <i>{st.session_state.company_info['tagline']}</i></p>", unsafe_allow_html=True)
    st.divider()

    st.info(st.session_state.company_info['description'])

    if st.session_state.project_image is not None:
        st.image(st.session_state.project_image, use_column_width=True)

    st.sidebar.header("Estimator Settings")
    L = st.sidebar.slider("Length (ft)", 1, 100, 20)
    B = st.sidebar.slider("Breadth (ft)", 1, 100, 15)
    H = st.sidebar.slider("Height (ft)", 1, 50, 10)
    
    col1, col2 = st.columns([1, 1])
    with col1:
        st.subheader("3D Structure Preview")
        fig = go.Figure(data=[go.Mesh3d(x=[0, 0, L, L, 0, 0, L, L], y=[0, B, B, 0, 0, B, B, 0], z=[0, 0, 0, 0, H, H, H, H], i=[7, 0, 0, 0, 4, 4, 6, 6, 4, 0, 3, 2], j=[3, 4, 1, 2, 5, 6, 5, 2, 0, 1, 6, 3], k=[0, 7, 2, 3, 6, 7, 1, 1, 5, 5, 7, 6], opacity=0.3, color='blue')])
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        area = L * B
        est_cost = area * st.session_state.rates["Gypsum Ceiling (sq.ft)"]
        st.metric("Total Area", f"{area} sq.ft")
        st.metric("Estimated Cost", f"Rs. {est_cost:,.2f}")
