# Ubuntu Server Setup Guide
## Virtual Machine Setup
1. **Create a VM for Ubuntu**:
   Set up a virtual machine with your virtualization software (e.g., VirtualBox, VMware) and configure the network settings as "Bridged Adapter." This allows the VM to have its own IP address on your local network.

2. **Install Putty and pcsp.exe**:
   Install PuTTY for SSH access to your Ubuntu server and an SCP (Secure Copy Protocol) tool like WinSCP (pcsp.exe) to transfer files between your local machine and the server.

## Web Server Setup

1. **Update the System Packages**:
   Run the following commands to update the package lists and upgrade the installed packages:
    ```bash
    sudo apt-get update
    sudo apt-get dist-upgrade
    ```

2. **Install Apache2**:
   Install the Apache web server:
    ```bash
    sudo apt-get install apache2
    ```

3. **Configure Firewall**:
   Check the available application profiles and enable the firewall while allowing Apache through:
    ```bash
    sudo ufw app list
    sudo ufw enable
    sudo ufw allow 'Apache'
    ```

4. **Change Permissions for Web Directory**:
   Change permissions for the Apache web directory to allow file modifications:
    ```bash
    sudo chmod -R 777 /var/www
    ```

5. **Temporary Firewall Disable**:
   Disable the firewall temporarily to allow file transfer using SCP:
    ```bash
    sudo ufw disable
    ```

6. **Transfer Website Files**:
   Use the following command to transfer your website files from your local machine to the server. Replace `<folder-name>` and `<domain-name>` with the appropriate values. These two names should be the same.
    ```bash
    scp -rv <folder-name> <username@ipaddress>:/var/www/html/<domain-name>
    ```

7. **Remove Default Index File**:
   Remove the default Apache index file:
    ```bash
    sudo rm /var/www/html/index.html
    ```

8. **Configure Apache Virtual Host**:
    - Navigate to the Apache configuration files directory:
    ```bash
    cd /etc/apache2/sites-available
    ```
    - Create a new site configuration file by copying the default configuration:
    ```bash
    sudo cp 000-default.conf website1.conf
    ```
    - Edit the newly created configuration file:
    ```bash
    sudo nano website1.conf
    ```
    - Adjust the values in the configuration file, including `ServerAdmin`, `ServerName`, and `DocumentRoot` to match your website's details. Save and close the file.

9. **Enable Site Configuration**:
   Enable the new site configuration:
    ```bash
    sudo a2ensite website1.conf
    ```

10. **Reload or Restart Apache**:
    Reload or restart the Apache web server to apply the changes:
    ```bash
    sudo systemctl reload apache2
    ```

11. **Test Your Website**:
    Open a web browser and visit your website by entering the domain name or IP address to verify that your server setup is working correctly.

- Use the `ifconfig` command to check and note the server's IP address.
- If you need to install network tools, you can use:
  ```bash
  sudo apt install net-tools

# Host file set up
1. **Go to file explorer and access the Windows directory**
2. **Access the System32 directory**
3. **Open the drivers directory**
4. **Open the etc directory**
5. **Open the host file**
6. **Enter the IP address of your server followed by the desired domain of your website**

# Allow retrieval of your current location
1. **Open Google Chrome**
2. **Paste and enter the following in your search bar: chrome://flags/#unsafely-treat-insecure-origin-as-secure**
3. **Navigate to the Insecure origins treated as secure tab and enter the complete url of your website**
4. **Enable the Insecure origins treated as secure feature**

   
