import React, { useEffect, useState } from 'react'
import { MdOutlineAttachMoney } from "react-icons/md";
import { FaRegSave } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import axios from 'axios';
import { MdDeleteForever } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { useDispatch,useSelector } from 'react-redux';
// import { fetchUnits } from '../redux/unitSlice';
import { addtax, deletetax, fetchtaxes, updatetax } from '../redux/taxSlice';
import { setAuthToken } from '../services/userService';
import { MdEdit } from "react-icons/md";

const Tax = () => {
    const dispatch=useDispatch()
    const  {items:taxes,status} = useSelector((state)=>state.taxes)

    const user=JSON.parse(localStorage.getItem("user"))
    const role=user?.role  || "user"
    const token=user?.token

    const [form, setForm] = useState({
        name: "",
        cgst_percent: "",
        sgst_percent: "",
        igst_percent: "",
        cess_percent: "",
        is_inclusive: false,
    })
    useEffect(() => {
       const user=JSON.parse(localStorage.getItem("user"))
       if(!user || !user.token)
        console.error("No user found Please Login")
       const token=user.token
       setAuthToken(token)
       dispatch(fetchtaxes())
    }, [dispatch])
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        let val = value;
  if (type === "number") val = Number(value);   
  if (type === "checkbox") val = checked; 
        setForm({ ...form, [name]: type === "checkbox" ? checked : value })
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if(editingTax){
                await dispatch(updatetax({id:editingTax,updatedData:form})).unwrap()
                setEditingTax(null)
                console.log("Tax Updated Successfully")
            }else{
              await dispatch(addtax(form)).unwrap()
              console.log("Tax added Successfully")
            }
           
            setForm({
                name: "",
                cgst_percent: "",
                sgst_percent: "",
                igst_percent: "",
                cess_percent: "",
                is_inclusive: false,
            })
            dispatch(fetchtaxes())

        }
        catch (err) {
            console.error(err.response?.data || err.message)
        }
    }

     const [search, setSearch] = useState("");
      const filteredtaxes = taxes.filter(
            (t) =>
                t.name.toLowerCase().includes(search.toLowerCase()) 
                
        );

    const handleDelete = async (id) => {
    dispatch(deletetax(id))
  };

  const [editingTax,setEditingTax]=useState(null)

  const handleEdit=(tax)=>{
    setEditingTax(tax._id)
    setForm({
         name: tax.name || "",
                cgst_percent:tax.cgst_percent || "",
                sgst_percent: tax.sgst_percent || "",
                igst_percent: tax.igst_percent || "",
                cess_percent: tax.cess_percent || "",
                is_inclusive: tax.is_inclusive || false,
    })
  }

    return (
        <div className="container mt-4 bg-gradient-warning">
            <h2 className="mb-4 d-flex align-items-center fs-5"><span className="  me-2 d-flex align-items-center" style={{color:"#4d6f99ff"}}><MdOutlineAttachMoney size={24} /></span>{" "}<b >TAX MASTER</b></h2>
            
            {["super_admin","admin"].includes(role) && (
            <form className="row g-3" onSubmit={handleSubmit}>

                <div className="col-md-6">
                    <label className="form-label">Tax Name</label>
                    <input type="text"
                        className="form-control bg-light"
                        name="name" value={form.name} onChange={handleChange}
                        placeholder='e.g,GST 18%' />
                </div>
                <div className="col-md-6">
                    <label className="form-label">CGST %</label>
                    <input type="number"
                        className="form-control bg-light" name="cgst_percent" value={form.cgst_percent} onChange={handleChange}
                        placeholder='0.00' />
                </div>
                <div className="col-md-6">
                    <label className="form-label">SGST %</label>
                    <input type="number"
                        className="form-control bg-light" name="sgst_percent" value={form.sgst_percent} onChange={handleChange}
                        placeholder='0.00' />
                </div>
                <div className="col-md-6">
                    <label className="form-label">IGST %</label>
                    <input type="number" name="igst_percent" value={form.igst_percent} onChange={handleChange}
                        className="form-control bg-light"
                        placeholder='0.00' />
                </div>
                <div className="col-md-6">
                    <label className="form-label">CESS % (Optional)</label>
                    <input type="number"
                        className="form-control bg-light" name="cess_percent" value={form.cess_percent} onChange={handleChange}
                        placeholder='0.00' />
                </div>
                <div className="col-md-6 form-check">
                    <input type="checkbox" className="form-check-input " name="is_inclusive" value={form.is_inclusive} onChange={handleChange} />
                    <label className="form-check-label">Inclusive Tax</label>
                </div>
                <div className="col-12 d-flex gap-2">
                    <button type="submit" className="btn btn-primary px-4 d-flex align-items-center justify-content-center"><span className="text-warning me-2 d-flex align-items-center"><FaRegSave /></span>{editingTax ? "Update Tax" :"Add Tax"}</button>
                    <button type="submit" className="btn btn-secondary btn btn-primary px-4 d-flex align-items-center justify-content-center"> <span className='me-2 d-flex align-items-center' ><FcCancel /></span>Cancel</button>
                </div>
            </form>)}
            <br />


            <div className="card shadow-sm my-4">
                <div className="card-body">
                    <h5>Existing Tax Rates</h5>
                     <div className="mt-4 mb-2 input-group">
                                                      <input type="text" className="form-control" placeholder="Search Category code, Category name" value={search} onChange={(e) => setSearch(e.target.value)} />
                                                      <span className="input-group-text"><FaSearch /></span>
                                                  </div>
                    <table className="table table-bordered table-striped">
                        <thead className="table-dark">
                            <tr>
                                <th className="fw-bold">Tax Name/Value</th>
                                <th className="fw-bold">CGST</th>
                                <th className="fw-bold">SGST</th>
                                <th className="fw-bold">IGST</th>
                                <th className="fw-bold">CESS</th>
                                <th className="fw-bold">Inclusive Tax</th>
                                <th className="fw-bold">Actions</th>

                            </tr>
                        </thead>
                        <tbody>
                            {filteredtaxes.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="text-center">
                                        No taxes found.
                                    </td>
                                </tr>
                            ) : (
                            taxes.map(t => (
                                <>
                                    <tr key={t._id}>
                                        <td>{t.name}</td>
                                        <td>{t.cgst_percent}</td>
                                        <td>{t.sgst_percent}</td>
                                        <td>{t.igst_percent}</td>
                                        <td>{t.cess_percent}</td>
                                        <td className={t.is_inclusive ? "text-success" : "text-danger"}>
                                            {t.is_inclusive ? "Active" : "Inactive"}
                                        </td>
                                        <td>
                                            {["super_admin","admin"].includes(role) ? (
                                                <>
                                                <button className='btn btn-warning btn-sm me-2' onClick={()=>handleEdit(t)}><MdEdit/>Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(t._id)}>
                                                <span className="text-warning">
                                                    <MdDeleteForever />
                                                </span>
                                                Delete
                                            </button></>
                                            ):(
                                              <button className="btn btn-secondary btn-sm" disabled>
                                                        View Only
                                                    </button>    
                                            )}</td>
                                    </tr>
                                </>
                            )
                            ))}
                        </tbody>
                        </table>
                </div>
            </div>
        </div>
    )
}

export default Tax