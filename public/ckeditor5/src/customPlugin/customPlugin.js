import Plugin from '@ckeditor/ckeditor5-core/src/plugin'
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview'
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository'
import FileDialogButtonView from '@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview'

export default class CustomPlugin extends Plugin {
  init() {
    const editor = this.editor
    // console.log('editoreditor==', editor)
    // // 创建按钮
    editor.ui.componentFactory.add('insertFile', (locale) => {
      const view = new FileDialogButtonView(locale)

      view.buttonView.set({
        label: '插入文件',
        icon: '<svg t="1716950651764" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="16974" width="200" height="200"><path d="M456.192 359.862857l104.594286 73.252572-266.057143-7.661715-92.525714-243.419428 98.870857 69.174857S520.173714-153.910857 974.299429 91.538286l-18.084572 25.782857C557.110857 64.786286 456.192 359.862857 456.192 359.862857z m390.985143 265.142857c-4.809143-14.482286-24.594286-26.276571-44.288-26.276571H88.173714c-19.766857 0-31.817143 11.794286-27.172571 26.276571l119.387428 366.628572c4.717714 14.665143 24.576 26.459429 44.269715 26.459428h714.642285c19.693714 0 31.817143-11.885714 27.099429-26.441143l-119.222857-366.628571z" p-id="16975" fill="#707070"></path><path d="M728.502857 370.523429c-40.923429-2.596571-64.292571 63.890286-76.324571 116.388571H220.507429a35.657143 35.657143 0 0 0-35.657143 35.638857v40.356572h618.057143c17.005714 0 32.365714 4.736 45.897142 12.8 13.348571 8.118857 25.782857 19.510857 32.219429 38.162285l89.856 276.370286V450.761143s-3.584-80.237714-55.186286-80.237714H728.502857z" p-id="16976" fill="#707070"></path></svg>', // 自定义图标，需要在CSS中定义
        tooltip: true,
        isEnabled: false,
        class: 'custom_insert_file'
      })
      // 初始化时也设置一次，以防编辑器初始状态就是只读
      view.buttonView.isEnabled = !editor.isReadOnly
      // 动态设置按钮的启用状态，基于编辑器的只读属性
      this.listenTo(editor, 'change:isReadOnly', (_, isReadOnly) => {
        view.buttonView.isEnabled = !editor.isReadOnly
      })

      view.on('done', (evt, files) => {
        const file = files[0]

        if (file) {
          const fileRepository = editor.plugins.get(FileRepository)
          const loader = fileRepository.createLoader(file)
          if (loader) {
            const insertPosition =
              editor.model.document.selection.getFirstPosition()
            loader
              .upload()
              .then((data) => {
                editor.model.change((writer) => {
                  writer.insertText(
                    file.name,
                    { linkHref: data.default },
                    insertPosition
                  )
                })
              })
              .catch((error) => {
                console.error('Upload failed:', error)
              })
          }
          // })
        }
      })

      return view
    })
  }
}
