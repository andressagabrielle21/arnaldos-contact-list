import React, { useState } from 'react'
import {useForm} from 'react-hook-form';
import {Button} from '../login/LoginStyles'
import {Container, CreatePage, Form} from './CreateStyles'
import { db } from '../../firebase-config';
import {addDoc, collection} from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CreateUser() {

  // Function that loads the CEP automatically
  const {register, setValue, setFocus, handleSubmit, formState: { errors }} = useForm();

  const usersCollectionReference = collection(db, "users");

  //Creating the variables that will handle the new user's information into the DB
  const [newName, setNewName] = useState("");
  const [newCEP, setNewCEP] = useState("");
  const [newNumero, setNewNumero] = useState("");

  const checkCEP = (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    try {
      axios.get(`https://opencep.com/v1/${cep}.json`)
        .then((response) => {
          setValue('rua', response.data.logradouro);
          setValue('bairro', response.data.bairro);
          setValue('cidade', response.data.localidade);
          setValue('estado', response.data.uf);
          // After autocomplete these past sections, it focus instantly to the input NÚMERO
          setFocus('numero')
        }); 
    }    
    // Error message when the API can't reach the inserted data
    catch(err) {
      console.log(err);
    }
  }

  // Function to redirect to the HOME page once the form is submitted
  let navigate = useNavigate(); 
  const routeChange = () =>{ 
    let path = `/home`; 
    navigate(path);
  }
  
  const onSubmit = (data) => {
    //Make the request to the Firestore DB and new user's data inside 
    const createUserForm = async () => {
      await addDoc(usersCollectionReference, {name: newName, cep: newCEP, rua: data.rua , numero: newNumero, bairro: data.bairro, cidade: data.cidade, estado: data.estado});
    };  
    createUserForm();

    alert(newName + " adicionado com sucesso!")
    routeChange(data);
  }    

  return (
      <Container>
          <CreatePage>
            <div className="titleDiv">
              <h1>Novo usuário</h1>
              <Link to="/home"><Button className='closeButton'>X</Button></Link>
            </div>
                  <Form onSubmit={handleSubmit(onSubmit)}> 
                    <input type="text" placeholder='Digite seu nome' value={newName} {...register("name", {required: true})} onChange={(e) => {setNewName(e.target.value);}}></input>
                    <input type="number" placeholder='Digite seu CEP' {...register("cep")} onBlur={checkCEP} onChange={(e) => {setNewCEP(e.target.value);}}></input>
                    <input type="text" placeholder='Rua (Logradouro)' {...register("rua")} ></input>
                    <input type="number"  placeholder='Número' value={newNumero} {...register("numero", {required: true})} onChange={(e) => {setNewNumero(e.target.value);}}></input>
                    <input type="text" placeholder='Bairro' {...register("bairro")} ></input>
                    <input type="text" placeholder='Cidade' {...register("cidade")}></input>
                    <input type="text" placeholder='Estado' {...register("estado")}></input>

                    {(errors.newName, errors.newNumero) && (
                    <div className="form_error">All form values are required to submit.</div>
                    )}
                    <Button>Salvar</Button>
                  </Form>
          </CreatePage>

      </Container>
  )
}