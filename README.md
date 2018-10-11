# Effectivity Services Sample Application

Effectivity Services enables you to create a single product structure that can handle numerous configurations. Effectivity identifies valid items to be used under different conditions. Managing a configurable structure is more efficient than managing structures for each unique instance.

Effectivity Services on the Aras PLM Platform provides the means to set effectivity within structures and the effectivity resolution engine that resolves structures for any given effectivity criteria.

Using Effectivity Services, a custom application can enable you to:

* Define effectivity variables (such as date, model, unit, lot, batch, and plant)
* Set effectivity conditions on relationships
* Resolve structures using effectivity to generate configured structures

In this sample application, effectivity is managed in the Part BOM structure of MakerBot Replicator, which is MakerBot's last open-source 3D printer. Differences among various configurations of the Replicator are managed via effectivity using Model, Unit and Production Date variables. The configurable MakerBot Replicator Part BOM structure can be resolved to a specific structure by providing the desired effectivity criteria.

This sample application is an Aras Community Project. It is not a standard product, and should not be deployed to production as-is. The purpose of the sample application is to demonstrate the Effectivity Services API capabilities so that custom applications can be built to address specific business requirements and processes. For more information on the Effectivity Services API, check out the [Effectivity Services Programmers Guide](./Documentation/Aras%20Innovator%2011.0%20-%20Effectivity%20Services%20Programmers%20Guide.pdf)

## History

Release | Notes
--------|--------
[11.0.15.1](https://github.com/ArasLabs/effectivity-sample-application/releases/tag/11.0.15.1) | Updated to support 11 SP15.
[11.0.14.1](https://github.com/ArasLabs/effectivity-sample-application/releases/tag/11.0.14.1) | First release.

#### Supported Aras Versions

Project | Aras
--------|------
[11.0.15.1](https://github.com/ArasLabs/effectivity-sample-application/releases/tag/11.0.15.1) | 11.0 SP15
[11.0.14.1](https://github.com/ArasLabs/effectivity-sample-application/releases/tag/11.0.14.1) | 11.0 SP14

## Installation

#### Important!
**Always back up your code tree and database before applying an import package or code tree patch!**

### Pre-requisites

1. Aras Innovator installed (version 11.0 SP15)
2. [Aras Update](http://www.aras.com/support/downloads/) installed (version 1.5)
3. Effectivity Services Sample Application package

### Install Steps

<!-- TODO: Add screenshot(s) -->

1. Run Aras Update.
2. Select **Local** in the sidebar.
3. Click **Add package reference** and select the ES Sample Application installation package.
4. Select the newly added package from the list and click **Install**.
5. Select the components you want to install and click **Next**.
    * Aras Innovator Code Tree Updates
    * Aras Innovator Database Updates
    * Sample Data Actions (Optional)
6. Choose **Detailed Logging** and click **Next**.
7. Enter the required parameters for the target Aras Innovator instance. Which parameters are required varies based on which components you have selected to install.
    * When selecting the install path for your Innovator instance, be sure to select the Innovator subfolder. 
    * Example: If your Innovator instance is installed in `C:\Program Files (x86)\Aras\11SP15`, select `C:\Program Files (x86)\Aras\11SP15\Innovator`.
8. Click **Install** to begin installing the package.
9. When the package finishes installing, close Aras Update.

### Load Sample Data (Optional)

1. Log into Innovator as admin.
2. In the main menu, select **Actions > Load Effectivity Sample Data**.
3. When prompted, enter the file path of the Effectivity Services Sample Application package.
    * Example: If the Effectivity Services Sample Application package was downloaded and unzipped to `C:\ESSample`, enter `C:\ESSample`.
4. Running the **Load Effectivity Sample Data** action will overwrite any effectivity sample data loaded by a previous execution. Click **Ok** in the warning prompt to continue loading.
5. After the load completes, navigate to **Design > Parts** in the TOC and run the search to confirm that the sample Parts have been added.

## Usage

For information on using the sample application, view [the documentation](./Documentation/Effectivity%20Services%20Sample%20Application.pdf).

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

For more information on contributing to this project, another Aras Labs project, or any Aras Community project, shoot us an email at araslabs@aras.com.

## Credits

Sample application created by Aras Development.

## License

Aras Labs projects are published to Github under the MIT license. See the [LICENSE file](./LICENSE.md) for license rights and limitations.