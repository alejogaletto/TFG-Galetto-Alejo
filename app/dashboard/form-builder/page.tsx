"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { v4 as uuidv4 } from "uuid"
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Textarea,
  Checkbox,
  Radio,
  SelectItem,
  Select,
} from "@nextui-org/react"
import { FaBars, FaPlus, FaTrash } from "react-icons/fa"
import { MdDragHandle } from "react-icons/md"
import { IoIosClose } from "react-icons/io"
import { useDisclosure } from "@nextui-org/react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react"

const initialFormElements = [
  { id: uuidv4(), type: "Text", label: "Nombre", placeholder: "Tu nombre" },
  { id: uuidv4(), type: "Email", label: "Email", placeholder: "Tu email" },
  { id: uuidv4(), type: "Textarea", label: "Mensaje", placeholder: "Tu mensaje" },
]

const FormBuilder = () => {
  const [formElements, setFormElements] = useState(initialFormElements)
  const [selectedElement, setSelectedElement] = useState(null)
  const [formName, setFormName] = useState("Untitled Form")
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false)
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false)
  const [connectedDatabase, setConnectedDatabase] = useState("")
  const [connectedTable, setConnectedTable] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [successMessage, setSuccessMessage] = useState("¡Gracias por tu envío!")
  const [notificationEmail, setNotificationEmail] = useState("")
  const [primaryColor, setPrimaryColor] = useState("#007bff")
  const [fontFamily, setFontFamily] = useState("Arial")

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [databaseOptions, setDatabaseOptions] = useState([
    { label: "Ninguna (Desconectar)", value: "" },
    { label: "Database 1", value: "database1" },
    { label: "Database 2", value: "database2" },
  ])

  const [tableOptions, setTableOptions] = useState([
    { label: "Ninguna (Desconectar)", value: "" },
    { label: "Table 1", value: "table1" },
    { label: "Table 2", value: "table2" },
  ])

  const [fieldSettings, setFieldSettings] = useState({
    label: "",
    placeholder: "",
    helpText: "",
    required: false,
    options: [],
  })

  const handleOpenDatabaseModal = () => {
    onOpen()
  }

  const handleCloseDatabaseModal = () => {
    onClose()
  }

  const handleDatabaseConnect = () => {
    if (connectedDatabase && connectedTable) {
      setIsDatabaseConnected(true)
    } else {
      setIsDatabaseConnected(false)
    }
    onClose()
  }

  const handleDatabaseDisconnect = () => {
    setConnectedDatabase("")
    setConnectedTable("")
    setIsDatabaseConnected(false)
    onClose()
  }

  const addFormElement = (type) => {
    const newElement = { id: uuidv4(), type: type, label: type, placeholder: "" }
    setFormElements([...formElements, newElement])
  }

  const onDragEnd = (result) => {
    if (!result.destination) {
      return
    }

    const items = Array.from(formElements)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setFormElements(items)
  }

  const handleElementClick = (element) => {
    setSelectedElement(element)
    setFieldSettings({
      label: element.label || "",
      placeholder: element.placeholder || "",
      helpText: element.helpText || "",
      required: element.required || false,
      options: element.options || [],
    })
  }

  const updateFormElement = (id, updatedValues) => {
    setFormElements((prevElements) =>
      prevElements.map((element) => (element.id === id ? { ...element, ...updatedValues } : element)),
    )
    setSelectedElement((prev) => ({ ...prev, ...updatedValues }))
  }

  const handleFieldSettingsChange = (e) => {
    const { name, value, type, checked } = e.target

    const updatedValue = type === "checkbox" ? checked : value

    setFieldSettings((prevSettings) => ({
      ...prevSettings,
      [name]: updatedValue,
    }))

    updateFormElement(selectedElement.id, { [name]: updatedValue })
  }

  const handleAddOption = () => {
    setFieldSettings((prevSettings) => ({
      ...prevSettings,
      options: [...prevSettings.options, { id: uuidv4(), text: "" }],
    }))
    updateFormElement(selectedElement.id, {
      options: [...(selectedElement.options || []), { id: uuidv4(), text: "" }],
    })
  }

  const handleOptionChange = (optionId, text) => {
    const updatedOptions = fieldSettings.options.map((option) =>
      option.id === optionId ? { ...option, text } : option,
    )
    setFieldSettings((prevSettings) => ({
      ...prevSettings,
      options: updatedOptions,
    }))
    updateFormElement(selectedElement.id, { options: updatedOptions })
  }

  const handleDeleteOption = (optionId) => {
    const updatedOptions = fieldSettings.options.filter((option) => option.id !== optionId)
    setFieldSettings((prevSettings) => ({
      ...prevSettings,
      options: updatedOptions,
    }))
    updateFormElement(selectedElement.id, { options: updatedOptions })
  }

  const deleteFormElement = (id) => {
    setFormElements((prevElements) => prevElements.filter((element) => element.id !== id))
    setSelectedElement(null)
  }

  const duplicateFormElement = (id) => {
    const elementToDuplicate = formElements.find((element) => element.id === id)
    if (elementToDuplicate) {
      const newElement = { ...elementToDuplicate, id: uuidv4() }
      setFormElements([...formElements, newElement])
    }
  }

  const toggleRequired = (id) => {
    const element = formElements.find((element) => element.id === id)
    if (element) {
      const updatedRequired = !element.required
      updateFormElement(id, { required: updatedRequired })
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar className="bg-white">
        <NavbarBrand>
          <Link href="#" className="font-bold text-xl">
            Volver a Formularios
          </Link>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link color="foreground" href="#">
              Panel de Control
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              Formularios
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              Bases de Datos
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              Flujos de Trabajo
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              Soluciones
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered">Conectado a: {connectedDatabase || "Ninguna"}</Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Static Actions">
              <DropdownItem key="new">Database 1</DropdownItem>
              <DropdownItem key="copy">Database 2</DropdownItem>
              <DropdownItem key="edit">Database 3</DropdownItem>
              <DropdownItem key="delete" className="text-danger" color="danger">
                Disconnect
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Button className="ml-2" color="primary" variant="flat">
            Vista Previa
          </Button>
          <Button className="ml-2" color="secondary" variant="flat">
            Ver Formulario Público
          </Button>
          <Button className="ml-2" color="success">
            Guardar
          </Button>
        </NavbarContent>
      </Navbar>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-200 p-4 space-y-4">
          <div>
            <h3 className="font-bold mb-2">Elementos del Formulario</h3>
            <Button className="w-full justify-start" size="sm" variant="light" onClick={() => addFormElement("Texto")}>
              <FaPlus className="mr-2" />
              Texto
            </Button>
            <Button className="w-full justify-start" size="sm" variant="light" onClick={() => addFormElement("Email")}>
              <FaPlus className="mr-2" />
              Email
            </Button>
            <Button className="w-full justify-start" size="sm" variant="light" onClick={() => addFormElement("Número")}>
              <FaPlus className="mr-2" />
              Número
            </Button>
            <Button
              className="w-full justify-start"
              size="sm"
              variant="light"
              onClick={() => addFormElement("Teléfono")}
            >
              <FaPlus className="mr-2" />
              Teléfono
            </Button>
            <Button
              className="w-full justify-start"
              size="sm"
              variant="light"
              onClick={() => addFormElement("Área de Texto")}
            >
              <FaPlus className="mr-2" />
              Área de Texto
            </Button>
            <Button
              className="w-full justify-start"
              size="sm"
              variant="light"
              onClick={() => addFormElement("Casilla de Verificación")}
            >
              <FaPlus className="mr-2" />
              Casilla de Verificación
            </Button>
            <Button
              className="w-full justify-start"
              size="sm"
              variant="light"
              onClick={() => addFormElement("Lista Desplegable")}
            >
              <FaPlus className="mr-2" />
              Lista Desplegable
            </Button>
            <Button
              className="w-full justify-start"
              size="sm"
              variant="light"
              onClick={() => addFormElement("Botón de Radio")}
            >
              <FaPlus className="mr-2" />
              Botón de Radio
            </Button>
            <Button className="w-full justify-start" size="sm" variant="light" onClick={() => addFormElement("Fecha")}>
              <FaPlus className="mr-2" />
              Fecha
            </Button>
            <Button className="w-full justify-start" size="sm" variant="light" onClick={() => addFormElement("Nombre")}>
              <FaPlus className="mr-2" />
              Nombre
            </Button>
          </div>

          <div>
            <h3 className="font-bold mb-2">Elementos de Diseño</h3>
            <Button
              className="w-full justify-start"
              size="sm"
              variant="light"
              onClick={() => addFormElement("Sección")}
            >
              <FaPlus className="mr-2" />
              Sección
            </Button>
            <Button
              className="w-full justify-start"
              size="sm"
              variant="light"
              onClick={() => addFormElement("Divisor")}
            >
              <FaPlus className="mr-2" />
              Divisor
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-center mb-4">
            <Input
              type="text"
              label="Nombre del Formulario"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            <div>
              <Button color="primary" onClick={handleOpenDatabaseModal}>
                {isDatabaseConnected ? "Base de Datos Conectada" : "Conectar Base de Datos"}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-300">
            <button className="py-2 px-4 font-semibold">Diseño</button>
            <button className="py-2 px-4 font-semibold">Configuración</button>
            <button className="py-2 px-4 font-semibold">Integraciones</button>
          </div>

          {/* Form Building Area */}
          <div className="mt-4">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="form-elements">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="min-h-48 p-4 border-2 border-dashed border-gray-400 rounded-md"
                  >
                    {formElements.length === 0 ? (
                      <div className="text-center text-gray-500">
                        <p className="text-lg">Comenzar</p>
                        <p>
                          Arrastra y suelta elementos del formulario desde la barra lateral para comenzar a construir tu
                          formulario, o elige de las opciones de agregar rápido a continuación.
                        </p>
                      </div>
                    ) : (
                      formElements.map((element, index) => (
                        <Draggable key={element.id} draggableId={element.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="bg-white shadow-md rounded-md p-4 mb-4 cursor-move"
                              onClick={() => handleElementClick(element)}
                            >
                              <div className="flex justify-between items-center">
                                <div {...provided.dragHandleProps} className="cursor-grab">
                                  <MdDragHandle className="text-gray-500 mr-2" />
                                </div>
                                <div>
                                  <Dropdown placement="bottom-end">
                                    <DropdownTrigger>
                                      <Button isIconOnly size="sm" variant="light">
                                        <FaBars />
                                      </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu aria-label="Element Actions">
                                      <DropdownItem key="edit" onClick={() => handleElementClick(element)}>
                                        Editar Configuración
                                      </DropdownItem>
                                      <DropdownItem key="duplicate" onClick={() => duplicateFormElement(element.id)}>
                                        Duplicar
                                      </DropdownItem>
                                      <DropdownItem key="required" onClick={() => toggleRequired(element.id)}>
                                        {element.required ? "Hacer Opcional" : "Hacer Requerido"}
                                      </DropdownItem>
                                      <DropdownItem
                                        key="delete"
                                        className="text-danger"
                                        color="danger"
                                        onClick={() => deleteFormElement(element.id)}
                                      >
                                        Eliminar
                                      </DropdownItem>
                                    </DropdownMenu>
                                  </Dropdown>
                                </div>
                              </div>

                              <div>
                                {element.type === "Texto" && (
                                  <Input type="text" label={element.label} placeholder={element.placeholder} readOnly />
                                )}
                                {element.type === "Email" && (
                                  <Input
                                    type="email"
                                    label={element.label}
                                    placeholder={element.placeholder}
                                    readOnly
                                  />
                                )}
                                {element.type === "Número" && (
                                  <Input
                                    type="number"
                                    label={element.label}
                                    placeholder={element.placeholder}
                                    readOnly
                                  />
                                )}
                                {element.type === "Teléfono" && (
                                  <Input type="tel" label={element.label} placeholder={element.placeholder} readOnly />
                                )}
                                {element.type === "Área de Texto" && (
                                  <Textarea label={element.label} placeholder={element.placeholder} readOnly />
                                )}
                                {element.type === "Casilla de Verificación" && (
                                  <Checkbox isSelected={false} isDisabled>
                                    {element.label}
                                  </Checkbox>
                                )}
                                {element.type === "Lista Desplegable" && (
                                  <Select isDisabled label={element.label}>
                                    <SelectItem key="option1" value="option1">
                                      Opción 1
                                    </SelectItem>
                                    <SelectItem key="option2" value="option2">
                                      Opción 2
                                    </SelectItem>
                                  </Select>
                                )}
                                {element.type === "Botón de Radio" && (
                                  <Radio.Group isDisabled label={element.label}>
                                    <Radio value="option1">Opción 1</Radio>
                                    <Radio value="option2">Opción 2</Radio>
                                  </Radio.Group>
                                )}
                                {element.type === "Fecha" && <Input type="date" label={element.label} readOnly />}
                                {element.type === "Nombre" && (
                                  <Input type="text" label={element.label} placeholder={element.placeholder} readOnly />
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Quick Add Options */}
            {formElements.length === 0 && (
              <div className="mt-4 flex justify-center space-x-4">
                <Button color="primary" onClick={() => addFormElement("Texto")}>
                  Agregar Campo
                </Button>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-6 flex justify-center">
              <Button color="success">Enviar</Button>
            </div>
          </div>
        </div>

        {/* Field Settings Sidebar */}
        {selectedElement && (
          <div className="w-80 bg-gray-100 p-4 border-l border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Configuración del Campo</h3>
              <Button isIconOnly variant="light" onClick={() => setSelectedElement(null)}>
                <IoIosClose />
              </Button>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                label="Etiqueta"
                name="label"
                value={fieldSettings.label}
                onChange={handleFieldSettingsChange}
              />
              <Input
                type="text"
                label="Marcador de Posición"
                name="placeholder"
                value={fieldSettings.placeholder}
                onChange={handleFieldSettingsChange}
              />
              <Input
                type="text"
                label="Texto de Ayuda"
                name="helpText"
                value={fieldSettings.helpText}
                onChange={handleFieldSettingsChange}
                description="Información adicional sobre este campo"
              />

              {selectedElement.type === "Área de Texto" && (
                <Input
                  type="number"
                  label="Filas"
                  name="rows"
                  value={fieldSettings.rows}
                  onChange={handleFieldSettingsChange}
                />
              )}

              {["Lista Desplegable", "Botón de Radio"].includes(selectedElement.type) && (
                <div>
                  <label className="block font-medium text-gray-700">Opciones</label>
                  {fieldSettings.options.map((option) => (
                    <div key={option.id} className="flex items-center mb-2">
                      <Input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(option.id, e.target.value)}
                        className="mr-2"
                      />
                      <Button isIconOnly color="danger" variant="light" onClick={() => handleDeleteOption(option.id)}>
                        <FaTrash />
                      </Button>
                    </div>
                  ))}
                  <Button size="sm" color="primary" onClick={handleAddOption}>
                    Agregar Opción
                  </Button>
                </div>
              )}

              <Checkbox isSelected={fieldSettings.required} onChange={handleFieldSettingsChange} name="required">
                Campo requerido
              </Checkbox>

              <div>
                <h4 className="font-semibold">Mapeo de Base de Datos</h4>
                <p className="text-sm text-gray-500">
                  Mapea este campo del formulario a un campo de la base de datos para guardar los datos del envío
                </p>
                <Select
                  label="Seleccionar campo de base de datos"
                  placeholder="No mapeado"
                  items={[
                    { label: "Ninguno", value: "" },
                    { label: "Campo 1", value: "field1" },
                    { label: "Campo 2", value: "field2" },
                  ]}
                >
                  {(item) => <SelectItem key={item.value}>{item.label}</SelectItem>}
                </Select>
              </div>

              <div className="flex justify-between">
                <Button color="danger" variant="flat" onClick={() => deleteFormElement(selectedElement.id)}>
                  Eliminar
                </Button>
                <Button color="secondary" variant="flat" onClick={() => duplicateFormElement(selectedElement.id)}>
                  Duplicar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Database Connection Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Conectar Base de Datos</ModalHeader>
              <ModalBody>
                <p>
                  Vincula tu formulario a una base de datos para almacenar envíos y usar campos de base de datos para la
                  generación de formularios.
                </p>

                <Select
                  label="Seleccionar Base de Datos"
                  placeholder="Selecciona una base de datos"
                  items={databaseOptions}
                  selectedKeys={[connectedDatabase]}
                  onSelectionChange={(keys) => setConnectedDatabase(keys.currentKey)}
                >
                  {(item) => <SelectItem key={item.value}>{item.label}</SelectItem>}
                </Select>

                <Select
                  label="Seleccionar Tabla"
                  placeholder="Selecciona una tabla"
                  items={tableOptions}
                  selectedKeys={[connectedTable]}
                  onSelectionChange={(keys) => setConnectedTable(keys.currentKey)}
                >
                  {(item) => <SelectItem key={item.value}>{item.label}</SelectItem>}
                </Select>

                <Checkbox className="mt-4">Mapear automáticamente campos basado en tipo y nombre</Checkbox>

                <h4 className="font-semibold mt-4">Mapeos de Campos</h4>
                <p className="text-sm text-gray-500">Cómo se guardan los datos del formulario</p>
                <p className="text-sm text-gray-500">
                  Los envíos del formulario se almacenarán como nuevos registros en la tabla{" "}
                  {connectedTable || "[Seleccionar Tabla]"}. Los campos mapeados guardarán datos en los campos
                  correspondientes de la base de datos. Los campos que no estén mapeados no se guardarán.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="primary" onPress={handleDatabaseConnect}>
                  Conectar Base de Datos
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default FormBuilder
