const setup = async () => {
  // test out poke api using axios here
  console.log('test');
  const res = await axios.get("https://pokeapi.co/api/v2/pokemon/1");
  console.log(res.data);
};
