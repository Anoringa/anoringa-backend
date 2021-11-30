# Anoringa Backend
the rest api service of anoringa


heroku logs --tail --app agile-everglades-15507

based on:
https://github.com/maitraysuthar/rest-api-nodejs-mongodb




requeriments:
- node v14
    
    
recommendations:
- use [nodist](https://chocolatey.org/install#individual) to manage node versions
  - requeriments [chocolatey](https://chocolatey.org/install#individual)

```Powershell
# setup windows scripting policys
Set-ExecutionPolicy -Scope LocalMachine -ExecutionPolicy Unrestricted

# install nodist using chocolatey
choco install nodist

# setup node 14 and npm with nodist
nodist + 14
nodist global 14
nodist npm global match


# check node and npm version
node -v
npm -v

# solve cache issues deleting cached files
npm cache clean --force
rm  node_modules
```